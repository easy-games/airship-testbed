import { keys } from "../Util/ObjectUtils";
import { HttpInflightThrottle, InflightTask, KeyType } from "./HttpInflightThrottle";

export interface RetryConfig {
    // Time waiting in seconds before we ditch the request and throw an error.
    maxWaitingSeconds?: number;
    // Key to use for uniquely identifying a request, when a key is rate limited all other keys
    // will assume the rate limit has been reached for them as well.
    //
    // Not providing this key will disable proactive rate limiting.
    retryKey?: string;
}

export const DefaultRetryConfig: RetryConfig = {
    maxWaitingSeconds: 120,
}

class HttpExecutionPackage implements KeyType {
    private readonly maxWaitingSeconds: number | undefined;
    public readonly retryKey: string | undefined;

    constructor(private readonly functor: () => HttpResponse, config: RetryConfig) {
        if (config.maxWaitingSeconds === undefined || config.maxWaitingSeconds < 0) {
            this.maxWaitingSeconds = undefined;
        } else {
            this.maxWaitingSeconds = config.maxWaitingSeconds;
        }
        this.retryKey = config.retryKey;
    }

    public execute() {
        return this.functor();
    }

    public shouldRemove(createdAt: number, additionalWaitTime: number): boolean {
        if (this.maxWaitingSeconds === undefined) {
            return false;
        }

        const now = os.time() + additionalWaitTime;
        const elapsed = now - createdAt;
        return elapsed >= this.maxWaitingSeconds;
    }
}

export interface RetryInformation {
    postedAt: number;
    resetAfter: number;
    remainingRequests: number;
    acquiredTickets: number;
}

// translates a reset after value to the current value based on the time the value was posted
function translateResetAfter(postedAt: number, resetAfter: number): number {
    return resetAfter - (os.time() - postedAt);
}

const inflightTasks: {[key: string]: number} = {};
const retryData: {[key: string]: RetryInformation} = {};

// clean up any unnecessary retry data every 30 seconds
task.spawnDetached(() => {
    while (task.unscaledWait(30)) {
        for (const key of keys(retryData)) { 
            const retryInfo = retryData[key];
            if (translateResetAfter(retryInfo.postedAt, retryInfo.resetAfter) <= 0) {
                delete retryData[key];
            }
        }
    }
});

// return the time remaining before the rate limit is reset, or undefined if the key is not rate limited
function tryAcquireRateLimitTicket(retryKey: string | undefined): number | undefined {
    if (retryKey === undefined) return undefined;
    
    const retryInfo = retryData[retryKey];
    if (retryInfo === undefined) return undefined;

    const resetAfter = translateResetAfter(retryInfo.postedAt, retryInfo.resetAfter);

    if (resetAfter <= 0) {
        delete retryData[retryKey];
        return undefined;
    }

    if (retryInfo.acquiredTickets < retryInfo.remainingRequests) {
        retryData[retryKey].acquiredTickets++;
        return undefined;
    }

    return resetAfter;
}

// return the time remaining before the rate limit is reset, or undefined if the request was not rate limited
// return undefined if the request could not be rate limited due to a missing header
function processHttpResponse(retryKey: string | undefined, response: HttpResponse): number | undefined {
    let resetAfter: number | undefined;
    let remainingRequests: number | undefined;

    if (response.statusCode === 429) {
        resetAfter = tonumber(response.GetHeader("Retry-After"));

        if (resetAfter === undefined) {
            return undefined;
        }

        if (resetAfter === 0) {
            return 1; // retry in 1 second & don't mark it
        }

        if (retryKey === undefined) {
            return resetAfter;
        }

        remainingRequests = 0;
    } else if (retryKey === undefined) {
        return 0;
    } else {
        resetAfter = tonumber(response.GetHeader("RateLimit-Reset"));
        remainingRequests = tonumber(response.GetHeader("RateLimit-Remaining"));

        if (resetAfter === undefined || remainingRequests === undefined) {
            return 0;
        }
    }

    retryData[retryKey] = {
        postedAt: os.time(),
        resetAfter: resetAfter,
        remainingRequests: remainingRequests,
        acquiredTickets: inflightTasks[retryKey]! - 1,
    }

    return response.statusCode === 429 ? resetAfter : 0;
}

// handles hat happens to an inflight task when a rate limit is received for a certain amount of time
function handleActiveRateLimit(inflightTask: InflightTask<HttpExecutionPackage, HttpResponse>, resetAt: number) {
    throttle.removeWaiting(resetAt, -1);
    if (inflightTask.shouldRemove(resetAt)) {
        inflightTask.reject("Http request timed out while waiting.");
        return;
    } else {
        task.unscaledDelayDetached(resetAt, () => {
            // restack request
            throttle.runTask(inflightTask);
        });
        return;
    }
}

const throttle = HttpInflightThrottle(100, (inflightTask: InflightTask<HttpExecutionPackage, HttpResponse>) => {
    const retryKey = inflightTask.key.retryKey;
    const rateLimitResetsAt = tryAcquireRateLimitTicket(retryKey);
    if (rateLimitResetsAt !== undefined) {
        handleActiveRateLimit(inflightTask, rateLimitResetsAt);
        return;
    }

    try {
        if (retryKey !== undefined) {
            // add 1 to the inflight task directory, used to prevent 429 hits
            if (inflightTasks[retryKey] === undefined) {
                inflightTasks[retryKey] = 1;
            } else {
                inflightTasks[retryKey] += 1;
            }
        }
        const response = inflightTask.key.execute();
        const activeRateLimitResetsAt = processHttpResponse(retryKey, response);

        if (activeRateLimitResetsAt === undefined) {
            // this is kind of a mouthful
            inflightTask.reject("Could not determine when to retry request due to a missing header during a 429.");
            return;
        }

        if (activeRateLimitResetsAt > 0) {
            handleActiveRateLimit(inflightTask, activeRateLimitResetsAt);
            return;
        }
        inflightTask.resolve(response);
    } catch (err) {
        inflightTask.reject(err);
    } finally {
        // remove 1 from the inflight tasks directory
        if (retryKey !== undefined) {
            inflightTasks[retryKey] -= 1;
            if (inflightTasks[retryKey] === 0) {
                delete inflightTasks[retryKey];
            }
        }
    }
});

export const ThrottleHttp = (functor: () => HttpResponse, config: RetryConfig = DefaultRetryConfig): Promise<HttpResponse> => {
    return throttle.run(new HttpExecutionPackage(functor, config));
}
