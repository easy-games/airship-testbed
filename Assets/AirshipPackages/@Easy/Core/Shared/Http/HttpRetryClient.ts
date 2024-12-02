export enum RetryMethod {
    // Retries directly based off the headers sent, assumes there is not another candidate using this route.
    // This is useful for user-based routes where we assume there is only one user accessing the limited routes.
    Direct,
    // Retries with a jitter using the headers sent as a base, using the jitter to determine the next retry.
    // This is useful for server-based routes where we don't know how many servers are accessing specific routes.
    JitterBackoff,
}

export interface CommonRetryConfig {
    maxInflightRequests: number;
    // Time waiting in seconds before we ditch the request and throw an error.
    maxWaitingSeconds?: number;
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

type HttpFunctor = (...params: any[]) => HttpResponse;

class HttpExecutionPackage<M extends RetryMethod, F extends HttpFunctor> {
    public readonly id: string;
    public readonly createdAt: number;

    constructor(
        public readonly key: string,
        private readonly functor: F,
        private readonly params: Parameters<F>,
        public readonly config: RetryConfig<M>,
        public readonly resolver: (response: HttpResponse) => void,
        public readonly rejector: (error: any) => void,
    ) {
        this.createdAt = os.time();
    }

    public execute(): HttpResponse {
        return this.functor(...this.params);
    }
}

type GenericExecutionPackage<M extends RetryMethod> = HttpExecutionPackage<M, any>;

type InternalHttpManagerHttpFunctionsRef = Omit<InternalHttpManagerConstructor, 
    "editorAuthToken" | "editorUserId" | "authToken" | "SetAuthToken" | "SetEditorAuthToken"
>
type InternalHttpManagerHttpFunctions = {
    [K in keyof InternalHttpManagerHttpFunctionsRef]: (...params: Parameters<InternalHttpManagerHttpFunctionsRef[K]>) => Promise<HttpResponse>;
}

export interface RetryInformation {
    postedAt: number;
    resetAfter: number;
    remainingRequests: number;
}

export class HttpRetryClientClass<M extends RetryMethod> implements InternalHttpManagerHttpFunctions {
    private retryData: Record<string, RetryInformation> = {};
    private inflightRequests: Record<string, number> = {};
    private waitingRequests: Record<string, Array<GenericExecutionPackage<M>>> = {};
    private popping: Record<string, boolean> = {};

    constructor(private readonly method: M) {}

    private CleanupWaitingRequests(key: string, additionalWait: number = 0): void {
        const timeout = os.time() + additionalWait;

        const badIndexes = [];
        for (let i = 0; i < this.waitingRequests[key].size(); i++) {
            const next = this.waitingRequests[key][i];
            if (!next.config.maxWaitingSeconds) {
                continue;
            }

            if ((timeout - next.createdAt) >= next.config.maxWaitingSeconds) {
                next.rejector("Http request exceeded max waiting time.");
                badIndexes.push(i);
            }
        }

        let removedCount = 0;
        for (const badIndex of badIndexes) {
            this.waitingRequests[key].remove(badIndex - removedCount);
            removedCount += 1;
        }
    }

    private PopMore(key: string): void {
        const next = this.waitingRequests[key].pop();

        if (!next) {
            return;
        }

        const config = next.config;
        const currentInflight = this.inflightRequests[key];

        if (config.maxInflightRequests >= currentInflight) {
            return;
        }

        task.spawn(() => this.SendInFlight(next));
        
        if (config.maxInflightRequests === currentInflight + 1) {
            return;
        }

        for (let i = 0; i < config.maxInflightRequests - (currentInflight + 1); i++) {
            const next = this.waitingRequests[key].pop();
            if (!next) {
                return;
            }
            task.spawn(() => this.SendInFlight(next));
        }
    }

    private PopMoreOrWait(key: string): void {
        if (this.popping[key]) return;
        this.popping[key] = true;

        const retryData = this.retryData[key];

        if (!retryData) {
            this.CleanupWaitingRequests(key);
            this.PopMore(key);
            this.popping[key] = false;
            return;
        }

        // todo: integrate jitter for server-side backoff

        if (this.method === RetryMethod.Direct) {
            this.CleanupWaitingRequests(key);
            task.delay(retryData.resetAfter, () => {
                delete this.retryData[key];
                this.PopMore(key);
                this.popping[key] = false;
            });
        }
    }

    private Resolve(executor: GenericExecutionPackage<M>, response: HttpResponse, popMore = true): void {
        this.inflightRequests[executor.key] -= 1;
        executor.resolver(response);
        if (popMore) {
            this.PopMoreOrWait(executor.key);
        } else {
            this.CleanupWaitingRequests(executor.key);
        }
    }

    private Reject(executor: GenericExecutionPackage<M>, error: any, popMore = true): void {
        this.inflightRequests[executor.key] -= 1;
        executor.rejector(error);
        if (popMore) {
            this.PopMoreOrWait(executor.key);
        } else {
            this.CleanupWaitingRequests(executor.key);
        }
    }

    private SendInFlight(executor: GenericExecutionPackage<M>): void {
        this.inflightRequests[executor.key] += 1;
        try {
            const response = executor.execute();

            if (response.statusCode === 429) {
                const resetAfter = tonumber(response.GetHeader("Retry-After"));
                if (!resetAfter) {
                    this.Reject(executor, response);
                    return;
                }
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

            this.retryData[executor.key] = {
                postedAt: os.time(),
                resetAfter,
                remainingRequests,
            };
            this.Resolve(executor, response, false);

            if (remainingRequests === 0) {
                this.PopMoreOrWait(executor.key);
            }
        } catch (err) {
            this.Reject(executor, err);
        }
    }

    private Call<F extends (...params: any[]) => HttpResponse, M extends RetryMethod>(
        key: string, functor: F, params: Parameters<F>, config: RetryConfig<M>
    ): Promise<HttpResponse> {
        return new Promise((resolve, reject) => {
            const executionPackage = new HttpExecutionPackage(key, functor, params, config, resolve, reject);
            const currentInflight = this.inflightRequests[key];
            if (currentInflight >= config.maxInflightRequests) {
                this.waitingRequests[key].push(executionPackage);
            } else {
                this.SendInFlight(executionPackage);
            }
        });
    }

    public DeleteAsync(url: string, config: RetryConfig<M> = DefaultRetryConfig): Promise<HttpResponse> {
        return this.Call(url, InternalHttpManager.DeleteAsync, [url], config);
    }

    public GetAsync(url: string, config: RetryConfig<M> = DefaultRetryConfig): Promise<HttpResponse> {
        return this.Call(url, InternalHttpManager.GetAsync, [url], config);
    }

    public GetAsyncWithHeaders(url: string, headers: string, config: RetryConfig<M> = DefaultRetryConfig): Promise<HttpResponse> {
        return this.Call(url, InternalHttpManager.GetAsyncWithHeaders, [url, headers], config);
    }

    public PatchAsync(url: string, data: string, config: RetryConfig<M> = DefaultRetryConfig): Promise<HttpResponse> {
        return this.Call(url, InternalHttpManager.PatchAsync, [url, data], config);
    }

    // the overloads here make this kind of awkward
    public PostAsync(url: string, data?: string, config: RetryConfig<M> = DefaultRetryConfig): Promise<HttpResponse> {
        if (data) {
            return this.Call(url, () => InternalHttpManager.PostAsync(url, data), [], config);
        } else {
            return this.Call(url, () => InternalHttpManager.PostAsync(url), [], config); 
        }
    }

    public PutAsync(url: string, data: string, config: RetryConfig<M> = DefaultRetryConfig): Promise<HttpResponse> {
        return this.Call(url, InternalHttpManager.PutAsync, [url, data], config);
    }

    public PutImageAsync(url: string, filePath: string, config: RetryConfig<M> = DefaultRetryConfig): Promise<HttpResponse> {
        return this.Call(url, InternalHttpManager.PutImageAsync, [url, filePath], config);
    }
}

export const DirectHttpRetryClient = new HttpRetryClientClass(RetryMethod.Direct);
export const JitterHttpRetryClient = new HttpRetryClientClass(RetryMethod.JitterBackoff);
