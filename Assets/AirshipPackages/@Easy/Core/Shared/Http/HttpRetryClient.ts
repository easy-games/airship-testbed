import { CoreLogger } from "../Logger/CoreLogger";
import { values } from "../Util/ObjectUtils";

export enum RetryMethod {
    // Retries directly based off the headers sent, assumes there is not another candidate using this route.
    // This is useful for user-based routes where we assume there is only one user accessing the limited routes.
    Direct,
    // Retries with a jitter using the headers sent as a base, using the jitter to determine the next retry.
    // This is useful for server-based routes where we don't know how many servers are accessing specific routes.
    JitterBackoff,
}

export interface CommonRetryConfig {
    maxInflightRequests?: number;
    // Time waiting in seconds before we ditch the request and throw an error.
    maxWaitingSeconds?: number;
    // Optional key to use for uniquely identifying a request.
    // - if not provided, the key will be the full url including path params and query params
    key?: string;
}

export interface DirectRetryConfig extends CommonRetryConfig {
}

export interface JitterBackoffRetryConfig extends CommonRetryConfig {
}

export type RetryConfig<T extends RetryMethod> = T extends RetryMethod.Direct ? DirectRetryConfig : JitterBackoffRetryConfig;

export const DefaultRetryConfig: RetryConfig<RetryMethod.Direct> | RetryConfig<RetryMethod.JitterBackoff> = {
    maxInflightRequests: 10,
    maxWaitingSeconds: 120,
}

class HttpExecutionPackage<M extends RetryMethod> {
    public readonly createdAt: number;

    constructor(
        public readonly key: string,
        private readonly functor: HigherOrderFunction,
        private readonly params: string[],
        public readonly config: RetryConfig<M>,
        public readonly resolver: (response: HttpResponse) => void,
        public readonly rejector: (error: unknown) => void,
    ) {
        this.createdAt = os.time();
    }

    public execute(): HttpResponse {
        switch (this.functor) {
            case "DeleteAsync":
                return InternalHttpManager.DeleteAsync(this.params[0]);
            case "GetAsync":
                return InternalHttpManager.GetAsync(this.params[0]);
            case "GetAsyncWithHeaders":
                return InternalHttpManager.GetAsyncWithHeaders(this.params[0], this.params[1]);
            case "PatchAsync":
                return InternalHttpManager.PatchAsync(this.params[0], this.params[1]);
            case "PostAsync":
                if (this.params.size() === 2) {
                    return InternalHttpManager.PostAsync(this.params[0], this.params[1]);
                } else {
                    return InternalHttpManager.PostAsync(this.params[0]);
                }
            case "PutAsync":
                return InternalHttpManager.PutAsync(this.params[0], this.params[1]);
            case "PutImageAsync":
                return InternalHttpManager.PutImageAsync(this.params[0], this.params[1]);
        }
    }
}

type InternalHttpManagerHttpFunctionsRef = Omit<InternalHttpManagerConstructor, 
    "editorAuthToken" | "editorUserId" | "authToken" | "SetAuthToken" | "SetEditorAuthToken"
>
type InternalHttpManagerHttpFunctions<M extends RetryMethod> = {
    [K in keyof InternalHttpManagerHttpFunctionsRef]: (
        this: ThisParameterType<HttpRetryClient<M>>,
        ...params: Parameters<InternalHttpManagerHttpFunctionsRef[K]>
    ) => Promise<HttpResponse>;
}

type HigherOrderFunction = keyof InternalHttpManagerHttpFunctions<RetryMethod>;

export interface RetryInformation {
    postedAt: number;
    resetAfter: number;
    remainingRequests: number;
}

export class HttpRetryClient<M extends RetryMethod> implements InternalHttpManagerHttpFunctions<M> { 
    private retryData: Record<string, RetryInformation> = {};
    private inflightRequests: Record<string, number> = {};
    private waitingRequests: Record<string, Array<HttpExecutionPackage<M>>> = {};
    private popping: Record<string, boolean> = {};
    private globallyCappedWaiting: Set<string> = new Set();

    constructor(private readonly method: M, private readonly globalConfig: Omit<RetryConfig<M>, "key">) {}

    private TotalInflightRequests(): number {
        let totalRequests = 0;
        for (const value of values(this.inflightRequests)) {
            totalRequests += value;
        }
        return totalRequests;
    }

    private CleanupWaitingRequests(key: string, additionalWait: number = 0): void {
        const timeout = os.time() + additionalWait;

        const badIndexes = [];
        for (let i = 0; i < this.waitingRequests[key].size(); i++) {
            const req = this.waitingRequests[key][i];

            if (!req.config.maxWaitingSeconds) {
                continue;
            }

            const timeWaiting = timeout - req.createdAt;

            if (timeWaiting >= req.config.maxWaitingSeconds) {
                req.rejector("Http request exceeded max waiting time of " + tostring(req.config.maxWaitingSeconds) + " seconds.");
                badIndexes.push(i);
            } else if (this.globalConfig.maxWaitingSeconds && timeWaiting >= (this.globalConfig.maxWaitingSeconds as number)) {
                req.rejector("Http request exceeded global max waiting time of " + tostring(this.globalConfig.maxWaitingSeconds) + " seconds.");
                badIndexes.push(i);
            }
        }

        let removedCount = 0;
        for (const badIndex of badIndexes) {
            this.waitingRequests[key].remove(badIndex - removedCount);
            removedCount += 1;
        }

        CoreLogger.Warn(tostring(removedCount) + " http requests for " + key + " exceeded max waiting time. "
            + tostring(this.waitingRequests[key].size()) + " remaining in queue.");

        for (const key of this.globallyCappedWaiting) {
            this.CleanupWaitingRequests(key);
        }
    }

    private PopGloballyCappedWaiting() {
        let currentTotalInflight = this.TotalInflightRequests();

        if (this.globalConfig.maxInflightRequests && currentTotalInflight >= (this.globalConfig.maxInflightRequests as number)) {
            return;
        }

        for (const key of this.globallyCappedWaiting) {
            currentTotalInflight += this.PopMore(key);

            if (this.globalConfig.maxInflightRequests && currentTotalInflight >= (this.globalConfig.maxInflightRequests as number)) {
                return;
            }
        }
    }

    private PopMore(key: string): number {
        const totalInflight = this.TotalInflightRequests();

        if (this.globalConfig.maxInflightRequests && totalInflight >= (this.globalConfig.maxInflightRequests as number)) {
            if (this.inflightRequests[key] === 0 && this.waitingRequests[key].size() > 0) {
                CoreLogger.Warn(key + " halted queue execution due to global inflight cap.");
                this.globallyCappedWaiting.add(key);
            }
            return 0;
        }

        const req = this.waitingRequests[key].pop();

        if (!req) {
            return 0;
        }

        const config = req.config;
        const currentInflight = this.inflightRequests[key];

        if (config.maxInflightRequests && currentInflight >= config.maxInflightRequests) {
            this.waitingRequests[key].push(req);
            return 0;
        }

        this.SendInFlight(req);

        if (config.maxInflightRequests && config.maxInflightRequests <= (currentInflight + 1)) {
            // this is probably executing waiting requests 1 by 1, we shouldn't log here for each request
            // if the backup becomes too large and waits become too long there will be other logs hit noting
            // that the requests backed up too far
            //
            // maybe we should log here for exceptional cases, where the backup is incredibly large
            // I figure a rate limit would eventually be applied to the backup and another log would alert
            // in a less frequent way
            return 1;
        }

        if (this.globalConfig.maxInflightRequests && (this.globalConfig.maxInflightRequests as number) <= totalInflight + 1) {
            return 1;
        }

        let minRemaining: number | undefined;

        if (config.maxInflightRequests && this.globalConfig.maxInflightRequests) {
            const globalRemaining = (this.globalConfig.maxInflightRequests as number) - (totalInflight + 1);
            const localRemaining = config.maxInflightRequests - (currentInflight + 1);
            minRemaining = math.min(globalRemaining, localRemaining);
        } else if (config.maxInflightRequests) {
            minRemaining = config.maxInflightRequests - (currentInflight + 1);
        } else if (this.globalConfig.maxInflightRequests) {
            minRemaining = (this.globalConfig.maxInflightRequests as number) - (totalInflight + 1);
        }

        let spawnCount = 1;
        const iterCount = minRemaining ? minRemaining : this.waitingRequests[key].size();

        for (let i = 0; i < iterCount; i++) {
            const req = this.waitingRequests[key].pop();
            if (!req) {
                return spawnCount;
            }
            this.SendInFlight(req);
            spawnCount += 1;
        }

        const remainingSize = this.waitingRequests[key].size();
        if (remainingSize > 0) {
            CoreLogger.Warn(tostring(remainingSize) + " http requests for " + key + " backed up, waiting for inflight requests to drain.");
        }
        
        return spawnCount;
    }

    private PopMoreOrWait(key: string): void {
        if (this.popping[key]) return;
        this.popping[key] = true;

        const retryData = this.retryData[key];

        if (!retryData) {
            this.CleanupWaitingRequests(key);
            this.PopMore(key);
            this.PopGloballyCappedWaiting();
            this.popping[key] = false;
            return;
        }

        // todo: integrate jitter for server-side backoff

        if (this.method === RetryMethod.Direct) {
            this.CleanupWaitingRequests(key);
            CoreLogger.Warn(key + " http request halted for " + retryData.resetAfter + " seconds due to rate limiting.");
            task.delay(retryData.resetAfter, () => {
                delete this.retryData[key];
                this.PopMore(key);
                this.PopGloballyCappedWaiting();
                this.popping[key] = false;
            });
        }
    }

    private Resolve(executor: HttpExecutionPackage<M>, response: HttpResponse): void {
        this.inflightRequests[executor.key] -= 1;
        executor.resolver(response);
        this.PopMoreOrWait(executor.key);
    }

    private Reject(executor: HttpExecutionPackage<M>, cause: any): void {
        this.inflightRequests[executor.key] -= 1;
        executor.rejector(cause);
        this.PopMoreOrWait(executor.key);
    }

    private SendInFlight(executor: HttpExecutionPackage<M>): void {
        this.globallyCappedWaiting.delete(executor.key);
        this.inflightRequests[executor.key] += 1;
        task.spawn(() => {
            try {
                const response = executor.execute();

                if (response.statusCode === 429) {
                    const resetAfter = tonumber(response.GetHeader("Retry-After"));
                    if (!resetAfter) {
                        CoreLogger.Error(executor.key + " rate limited without providing proper headers."); 
                        this.Reject(executor, response);
                        return;
                    }
                    CoreLogger.Warn(executor.key + " rate limited, resetting after " + tostring(resetAfter) + " seconds.");
                    this.retryData[executor.key] = {
                        postedAt: os.time(),
                        resetAfter,
                        remainingRequests: 0,
                    };
                    this.inflightRequests[executor.key] -= 1;
                    this.waitingRequests[executor.key].push(executor);
                    this.PopMoreOrWait(executor.key);
                    return;
                }
                const resetAfter = tonumber(response.GetHeader("RateLimit-Reset"));
                const remainingRequests = tonumber(response.GetHeader("RateLimit-Remaining"));

                if (!resetAfter || !remainingRequests) {
                    delete this.retryData[executor.key];
                    this.Resolve(executor, response);
                    return;
                }

                if (remainingRequests > this.inflightRequests[executor.key]) {
                    delete this.retryData[executor.key];
                    this.Resolve(executor, response);
                    return;
                }

                if (!this.retryData[executor.key]) {
                    CoreLogger.Warn(
                        executor.key + " http requests backing up, " 
                        + tostring(remainingRequests) + " currently in flight, " 
                        + "halting sending for " + tostring(resetAfter) + " seconds."
                    );
                }

                this.retryData[executor.key] = {
                    postedAt: os.time(),
                    resetAfter,
                    remainingRequests,
                };
                this.Resolve(executor, response);
            } catch (err) {
                this.Reject(executor, err);
            }
        });
    }

    private Call<F extends (...params: any[]) => HttpResponse, M extends RetryMethod>(
        key: string, functor: HigherOrderFunction, params: Parameters<F>, config: RetryConfig<M>
    ): Promise<HttpResponse> {
        return new Promise((resolve, reject) => {
            const executionPackage = new HttpExecutionPackage(key, functor, params, config, resolve, reject);

            if (this.waitingRequests[key] === undefined) this.waitingRequests[key] = [];
            if (this.inflightRequests[key] === undefined) this.inflightRequests[key] = 0;

            const currentInflight = this.inflightRequests[key];
            if (config.maxInflightRequests && currentInflight >= config.maxInflightRequests) {
                this.waitingRequests[key].push(executionPackage);
            } else if (this.globalConfig.maxInflightRequests && this.TotalInflightRequests() >= (this.globalConfig.maxInflightRequests as number)) {
                this.waitingRequests[key].push(executionPackage);
                if (this.inflightRequests[key] === 0) {
                    this.globallyCappedWaiting.add(key);
                }
            } else {
                this.SendInFlight(executionPackage);
            }
        });
    }

    public DeleteAsync(url: string, config: RetryConfig<M> = DefaultRetryConfig): Promise<HttpResponse> {
        return this.Call(config.key || url, "DeleteAsync", [url], config);
    }

    public GetAsync(url: string, config: RetryConfig<M> = DefaultRetryConfig): Promise<HttpResponse> {
        return this.Call(config.key || url, "GetAsync", [url], config);
    }

    public GetAsyncWithHeaders(url: string, headers: string, config: RetryConfig<M> = DefaultRetryConfig): Promise<HttpResponse> {
        return this.Call(config.key || url, "GetAsyncWithHeaders", [url, headers], config);
    }

    public PatchAsync(url: string, data: string, config: RetryConfig<M> = DefaultRetryConfig): Promise<HttpResponse> {
        return this.Call(config.key || url, "PatchAsync", [url, data], config);
    }

    // the overloads here make this kind of awkward
    public PostAsync(url: string, data?: string, config: RetryConfig<M> = DefaultRetryConfig): Promise<HttpResponse> {
        if (data) {
            return this.Call(config.key || url, "PostAsync", [url, data], config);
        } else {
            return this.Call(config.key || url, "PostAsync", [url], config);
        }
    }

    public PutAsync(url: string, data: string, config: RetryConfig<M> = DefaultRetryConfig): Promise<HttpResponse> {
        return this.Call(config.key || url, "PutAsync", [url, data], config);
    }

    public PutImageAsync(url: string, filePath: string, config: RetryConfig<M> = DefaultRetryConfig): Promise<HttpResponse> {
        return this.Call(config.key || url, "PutImageAsync", [url, filePath], config);
    }
}

const DefaultGlobalConfig: Omit<RetryConfig<RetryMethod>, "key"> = {
    maxInflightRequests: 100,
    maxWaitingSeconds: 120,
};

export const DirectHttpRetryClient = new HttpRetryClient(RetryMethod.Direct, DefaultGlobalConfig);
export const JitterHttpRetryClient = new HttpRetryClient(RetryMethod.JitterBackoff, DefaultGlobalConfig);
