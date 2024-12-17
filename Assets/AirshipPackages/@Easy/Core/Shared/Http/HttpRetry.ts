import { CoreLogger } from "../Logger/CoreLogger";
import { keys } from "../Util/ObjectUtils";

/**
 * The default implementation which {@link RetryHttp429} will use to retrieve the retry time from the response.
 * This can be overridden by passing a custom implementation to the {@link RetryConfig.retrieveRetryTime} property.
 * 
 * @param response The http response which is being processed due to a 429 response code.
 * @returns A number representing the number of seconds to wait before retrying the request.
 *          If undefined is returned the promise returned by {@link RetryHttp429} will be resolved with the response.
 */
function defaultRetrieveRetryTime(response: HttpResponse): number | undefined {
    return tonumber(response.GetHeader("Retry-After"));
}

/**
 * A configuration object which configures a request for the {@link RetryHttp429} function.
 */
export interface RetryConfig {
    /**
     * A key used to identify a request, when a key is rate limited all other keys will assume the rate limit also applies to them.
     * 
     * Not providing this key will disable any proactive rate limiting.
     */
    retryKey?: string;

    /**
     * Modifies the default behavior of retrieving the retry time from the response.
     * 
     * The default implementation will look for the `Retry-After` header in the response.
     * 
     * @param response The http response which is being processed due to a 429 response code.
     * @returns A number representing the number of seconds to wait before retrying the request.
     *          If undefined is returned the promise returned by {@link RetryHttp429} will be resolved with the response.
     */
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

/**
 * @param receivedAt When the resetAfter time was received.
 * @param resetAfter The time to wait before retrying the request.
 * @returns The adjusted value of `resetAfter` based on when the value was received.
 */
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

/**
 * Checks if a rate limit is currently being applied to a key.
 * 
 * @param retryKey A key used to identify a type of request. When a key is rate limited all 
 * other keys will assume the rate limit has been reached for them as well.
 * @returns The time remaining before the rate limit is reset, or undefined if the key is not rate limited.
 */
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

/**
 * Determines if an executed request was rate limited.
 * 
 * @param config The configuration passed to {@link RetryHttp429}.
 * @param response The http response which is being processed due to a 429 response code.
 * @returns The time remaining before the rate limit is reset, or undefined if the request was not rate limited.
 */
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

/**
 * Executes an http task, retrying if the request is rate limited or if the {@link RetryConfig.retryKey}
 *  from {@link HttpTask.config} is actively being rate limited.
 * 
 * @param httpTask The task to be executed.
 */
function executeHttpTask(httpTask: HttpTask): void {
    const currentRateLimitResetsAt = isCurrentlyLimited(httpTask.config.retryKey);
    if (currentRateLimitResetsAt !== undefined) {
        // handle existing rate limit

        // TODO: remove the logging message here after testing is complete
        // if it's actively rate limited it should be logged earlier that the route was rate limited
        const retryKey = httpTask.config.retryKey;
        if (retryKey !== undefined) {
            CoreLogger.Warn(`Http request "${retryKey}" has an active rate limit of ${currentRateLimitResetsAt} seconds remaining.`);
        } else {
            CoreLogger.Warn(`Http request without a retry key has an active rate limit of ${currentRateLimitResetsAt} seconds remaining.`);
        }

        task.unscaledDelayDetached(currentRateLimitResetsAt + .5, () => { 
            CoreLogger.Log(`Http request "${retryKey}" has been continued.`);
            executeHttpTask(httpTask);
        });
        return;
    }

    try {
        const response = httpTask.execute();
        const activeRateLimitResetsAt = processHttpResponse(httpTask.config, response);

        if (activeRateLimitResetsAt === undefined) {
            // pass through 429 response, the header telling us how long to wait does not exist
            const retryKey = httpTask.config.retryKey;
            if (retryKey !== undefined) {
                CoreLogger.Warn(`Http request "${retryKey}" received a 429 response code but could not determine a retry time.`);
            } else {
                CoreLogger.Warn("Http request without a retry key received a 429 response code but could not determine a retry time.");
            }
            httpTask.resolve(response);
            return;
        }

        if (activeRateLimitResetsAt > 0) {
            // handle active rate limit
            const retryKey = httpTask.config.retryKey;
            if (retryKey !== undefined) {
                CoreLogger.Warn(`Http request "${retryKey}" was rate limited for ${activeRateLimitResetsAt} seconds.`);
            } else {
                CoreLogger.Warn(`Http request without a retry key was rate limited for ${activeRateLimitResetsAt} seconds.`);
            }
            task.unscaledDelayDetached(activeRateLimitResetsAt + .5, () => { 
                CoreLogger.Log(`Http request "${retryKey}" has been continued.`);
                executeHttpTask(httpTask);
            });
            return;
        }
        httpTask.resolve(response);
    } catch (err) {
        httpTask.reject(err);
    }
}

/**
 * Sets up a retry mechanism for a function which returns an HttpResponse. This retry mechanism uses the
 * standard 429 response code and the "Retry-After" header (by default) to determine when to retry the request.
 * 
 * @param httpRequest A function which returns an HttpResponse. This function will be called each time the request is tried.
 * @param config An optional configuration object, see {@link RetryConfig} for more details.
 * @returns A promise which when resolved will contain the response from the request. The promise will be rejected if the request fails.
 */
export const RetryHttp429 = (httpRequest: () => HttpResponse, config: RetryConfig = {}): Promise<HttpResponse> => {
    return new Promise((resolve, reject) => {
        const httpTask = new HttpTask(httpRequest, config, resolve, reject);
        executeHttpTask(httpTask);
    });
}
