import { keys } from "../Util/ObjectUtils";

function defaultRetrieveRetryTime(response: HttpResponse): number | undefined {
    return tonumber(response.GetHeader("Retry-After"));
}

export interface RetryConfig {
    // Key to use for uniquely identifying a request, when a key is rate limited all other keys
    // will assume the rate limit has been reached for them as well.
    //
    // Not providing this key will disable proactive rate limiting.
    retryKey?: string;

    retrieveRetryTime?: (response: HttpResponse) => number | undefined;
}

class HttpTask {
    constructor(
        private readonly httpRequest: () => HttpResponse,
        public readonly config: RetryConfig,
        public readonly resolve: (response: HttpResponse) => void,
        public readonly reject: (err: any) => void
    ) {
    }

    public execute() {
        return this.httpRequest();
    }
}

interface RetryInformation {
    receivedAt: number;
    resetAfter: number;
}

const retryData: {[key: string]: RetryInformation} = {};

// translates a reset after value to the current value based on the time the value was posted
function translateResetAfter(receivedAt: number, resetAfter: number): number {
    return resetAfter - (os.time() - receivedAt);
}

// clean up any unnecessary retry data every 30 seconds
task.spawnDetached(() => {
    while (task.unscaledWait(30)) {
        for (const key of keys(retryData)) { 
            const retryInfo = retryData[key];
            if (translateResetAfter(retryInfo.receivedAt, retryInfo.resetAfter) <= 0) {
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

    const resetAfter = translateResetAfter(retryInfo.receivedAt, retryInfo.resetAfter);

    if (resetAfter <= 0) {
        delete retryData[retryKey];
        return undefined;
    }

    return resetAfter;
}

// return the time remaining before the rate limit is reset, or undefined if the request was not rate limited
// return undefined if the request could not be rate limited due to a missing header
function processHttpResponse(config: RetryConfig, response: HttpResponse): number | undefined { 
    if (response.statusCode === 429) {
        const resetAfter = (config.retrieveRetryTime || defaultRetrieveRetryTime)(response);

        if (resetAfter === undefined) {
            return undefined;
        }

        if (resetAfter === 0) {
            return 1; // retry in 1 second & don't mark it
        }

        const retryKey = config.retryKey;
        if (retryKey === undefined) return resetAfter;

        retryData[retryKey] = {
            receivedAt: os.time(),
            resetAfter: resetAfter,
        }

        return resetAfter;
    }
    return 0;
}

function executeHttpTask(httpTask: HttpTask) {
    const currentRateLimitResetsAt = isCurrentlyLimited(httpTask.config.retryKey);
    if (currentRateLimitResetsAt !== undefined) {
        // handle active rate limit
        task.unscaledDelayDetached(currentRateLimitResetsAt, () => executeHttpTask(httpTask));
        return;
    }

    try {
        const response = httpTask.execute();
        const activeRateLimitResetsAt = processHttpResponse(httpTask.config, response);

        if (activeRateLimitResetsAt === undefined) {
            // pass through 429 response, the header telling us how long to wait does not exist
            httpTask.resolve(response);
            return;
        }

        if (activeRateLimitResetsAt > 0) {
            // handle active rate limit
            task.unscaledDelayDetached(activeRateLimitResetsAt, () => executeHttpTask(httpTask));
            return;
        }
        httpTask.resolve(response);
    } catch (err) {
        httpTask.reject(err);
    }
}

export const RetryHttp429 = (httpRequest: () => HttpResponse, config: RetryConfig = {}): Promise<HttpResponse> => {
    return new Promise((resolve, reject) => {
        const httpTask = new HttpTask(httpRequest, config, resolve, reject);
        executeHttpTask(httpTask);
    });
}
