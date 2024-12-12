import { keys } from "../Util/ObjectUtils";

export interface RetryConfig {
    // Key to use for uniquely identifying a request, when a key is rate limited all other keys
    // will assume the rate limit has been reached for them as well.
    //
    // Not providing this key will disable proactive rate limiting.
    retryKey?: string;
}

class HttpExecutionTask {
    public readonly retryKey: string | undefined;

    constructor(
        private readonly functor: () => HttpResponse,
        config: RetryConfig,
        public readonly resolve: (response: HttpResponse) => void,
        public readonly reject: (err: any) => void
    ) {
        this.retryKey = config.retryKey;
    }

    public execute() {
        return this.functor();
    }
}

interface RetryInformation {
    postedAt: number;
    resetAfter: number;
}

// translates a reset after value to the current value based on the time the value was posted
function translateResetAfter(postedAt: number, resetAfter: number): number {
    return resetAfter - (os.time() - postedAt);
}

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
function isCurrentlyLimited(retryKey: string | undefined): number | undefined {
    if (retryKey === undefined) return undefined;

    const retryInfo = retryData[retryKey];
    if (retryInfo === undefined) return undefined;

    const resetAfter = translateResetAfter(retryInfo.postedAt, retryInfo.resetAfter);

    if (resetAfter <= 0) {
        delete retryData[retryKey];
        return undefined;
    }

    return resetAfter;
}

// return the time remaining before the rate limit is reset, or undefined if the request was not rate limited
// return undefined if the request could not be rate limited due to a missing header
function processHttpResponse(retryKey: string | undefined, response: HttpResponse): number | undefined {
    if (response.statusCode === 429) {
        const resetAfter = tonumber(response.GetHeader("Retry-After"));

        if (resetAfter === undefined) {
            return undefined;
        }

        if (resetAfter === 0) {
            return 1; // retry in 1 second & don't mark it
        }

        if (retryKey === undefined) return resetAfter;

        retryData[retryKey] = {
            postedAt: os.time(),
            resetAfter: resetAfter,
        }

        return resetAfter;
    }
    return 0;
}

// handles hat happens to an inflight task when a rate limit is received for a certain amount of time
function handleActiveRateLimit(executionTask: HttpExecutionTask, resetAt: number) {
    task.unscaledDelayDetached(resetAt, () => {
        sendInFlight(executionTask);
    });
}

function sendInFlight(executionTask: HttpExecutionTask) {
    const currentRateLimit = isCurrentlyLimited(executionTask.retryKey);
    if (currentRateLimit !== undefined) {
        handleActiveRateLimit(executionTask, currentRateLimit);
        return;
    }

    try {
        const response = executionTask.execute();
        const activeRateLimitResetsAt = processHttpResponse(executionTask.retryKey, response);

        if (activeRateLimitResetsAt === undefined) {
            executionTask.resolve(response);
            return;
        }

        if (activeRateLimitResetsAt > 0) {
            handleActiveRateLimit(executionTask, activeRateLimitResetsAt);
            return;
        }
        executionTask.resolve(response);
    } catch (err) {
        executionTask.reject(err);
    }
}

export const RetryHttp429 = (functor: () => HttpResponse, config: RetryConfig = {}): Promise<HttpResponse> => {
    return new Promise((resolve, reject) => {
        const executionTask = new HttpExecutionTask(functor, config, resolve, reject);
        sendInFlight(executionTask);
    });
}
