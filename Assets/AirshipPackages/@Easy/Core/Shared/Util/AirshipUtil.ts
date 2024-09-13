import { DecodeJSON } from "@Easy/Core/Shared/json";
import { Result } from "@Easy/Core/Shared/Types/Result";

/**
 * Boilerplate for converting Lua async tuples to Result<T, string>
 * @param fn A function that returns a Promise<Result<T, string>>
 * @returns Result<T, string>
 */
export function awaitToResult<TResultGen, TResult extends Result<TResultGen, string>>(promise: Promise<TResult>): TResult {    
	const [success, result] = promise.await();
	if (!success) {
		return { success: false, error: "Unable to complete request." } as TResult;
	}
	return result;
}

/**
 * Options for processing the response
 */
interface ProcessReponseOptions {
	/** If true, an empty response will be considered successful and returned as undefined */
	allowEmptyData?: boolean;
	/**
	 * If true, an unsuccessful response with a matching status code
	 * will be returned as an error with the error field set to the response body
	 */
	returnErrorBodyForStatusCodes?: number[]; 
}

/**
 * Boilerplate for converting HttpResponse to Result<T, string>
 * @param res An HttpResponse object from InternalHttpManager
 * @param errorMsg The generic error message to display if the response is unsuccessful
 * @param options Options for processing the response
 * @returns Result<T, string>
 */
export function processResponse<T>(res: HttpResponse, errorMsg: string, options? : ProcessReponseOptions): Result<T, string> {
	if (!res.success || res.statusCode > 299) {
		if (options?.returnErrorBodyForStatusCodes?.includes(res.statusCode)) {
			return {
				success: false,
				error: res.data,
			};
		}
		warn(`${errorMsg}. Status Code:  ${res.statusCode}.\n`, res.error);
		return {
			success: false,
			error: res.error,
		};
	}

	if (!res.data) {
		if (options?.allowEmptyData) {
			return { success: true, data: undefined as T };
		} else {
			return { success: false, error: "No data returned." };
		}
	}

	return {
		success: true,
		data: DecodeJSON(res.data) as T,
	};
}