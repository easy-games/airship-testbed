import { HttpCallback, HttpRetryInstance } from "../Http/HttpRetry";
import { entries } from "../Util/ObjectUtils";
// note (Corey Shupe):
//  These types could come from any type package.
import { HttpRequestParams, MakeRequest } from "./content-service-types";

function isArrayLike<T extends defined>(value: unknown): value is T[] {
	if (!typeIs(value, "table")) return false;

	// a table always will start with a numeric key if it has an array part
	const [idx] = next(value);
	if (!typeIs(idx, "number") && !typeIs(idx, "nil")) return false;

	// To get the first dictionary "key" of a table, it's the size of the array (last index)
	const size = (value as defined[]).size();
	const [key] = next(value, size); // we check there's no dictionary component to the table
	return typeIs(key, "nil"); // an array should contain no dictionary keys
}

export function encodeURIComponent(component: string): string {
	const [encodedComponent] = string.gsub(component, "[^%a%d%-%_%.!~%*%'%(%)]", (value) => {
		const bytes = string.byte(value, 1, value.size());
		let encoded = "";

		for (const [_, byte] of ipairs(bytes)) {
			encoded = encoded + string.format("%%%02X", byte);
		}

		return encoded;
	});
	return encodedComponent;
}

function encodeQueryString(query: object) {
	let queryString = "";
	for (const [key, value] of entries(query)) {
		if (queryString === "") {
			queryString = "?";
		} else {
			queryString += "&";
		}

		const encodedKey = encodeURIComponent(tostring(key));

		if (isArrayLike<string | boolean | number>(value)) {
			queryString += `${encodedKey}[]=${value.map(tostring).map(encodeURIComponent).join(`&${encodedKey}[]=`)}`;
		} else {
			queryString += `${tostring(key)}=${encodeURIComponent(tostring(value))}`;
		}
	}
	return queryString;
}

const UNITY_MAKE_REQUEST_RETRY = HttpRetryInstance();

export type UnityMakeRequestError = {
	routeId: string;
	message: string;
	status: number;
};

/**
 * Static helper functions which can be applied for a UnityMakeRequestError type.
 */
interface UnityMakeRequestErrorStaticFunctions {
	/**
	 * Checks if a thrown error fits the object shape of a known error.
	 *
	 * This provides type narrowing for the UnityMakeRequestError type.
	 *
	 * @param err The thrown object to check.
	 * @returns True if the thrown object follows the shape of the UnityMakeRequestError type, false otherwise.
	 */
	IsInstance: (err: unknown) => err is UnityMakeRequestError;
	/**
	 * Creates a friendly display text from the provided error based on conventional api responses.
	 *
	 * @param error The error to create the display text from.
	 * @returns The decoded error message or first validation error, otherwise it will return undefined.
	 */
	DisplayText: (error: UnityMakeRequestError) => string | undefined;
}

/**
 * A helper object to operate on UnityMakeRequest errors.
 */
export const UnityMakeRequestError: UnityMakeRequestErrorStaticFunctions = {
	IsInstance: (err) => IsUnityMakeRequestError(err),
	DisplayText: (err) => UnityMakeRequestErrorDisplayText(err),
};

function IsUnityMakeRequestError(err: unknown): err is UnityMakeRequestError {
	if (!err) return false;
	const typedErr = err as Partial<UnityMakeRequestError>;
	return typedErr.message !== undefined && typedErr.status !== undefined;
}

function UnityMakeRequestErrorDisplayText(err: UnityMakeRequestError): string | undefined {
	let responseMessage: string | undefined;
	try {
		// Attempt to extract the message property from the response object.
		// It is an array if the error is from our backend validation framework
		const errObj = json.decode<{ message: unknown }>(err.message);
		if (errObj.message) {
			if (typeIs(errObj.message, "string")) {
				responseMessage = errObj.message;
			} else if (isArrayLike(errObj.message) && typeIs(errObj.message[0], "string")) {
				responseMessage = errObj.message[0];
			} else if (typeIs(errObj.message, "table")) {
				responseMessage = json.encode(errObj.message);
			} else {
				responseMessage = tostring(errObj.message);
			}
		} else {
			return;
		}
	} catch {
		return;
	}
	return responseMessage;
}

export function UnityMakeRequest(baseUrl: string): MakeRequest {
	return async <T>(request: HttpRequestParams<object>) => {
		const pathWithoutQueryString = baseUrl + request.path;
		const queryString = request.query !== undefined ? encodeQueryString(request.query) : "";
		const fullyResolvedPath = pathWithoutQueryString + queryString;
		const data: string | undefined = request.body !== undefined ? json.encode(request.body) : undefined;

		let executor: HttpCallback;

		switch (request.method) {
			case "GET":
				executor = () => InternalHttpManager.GetAsync(fullyResolvedPath);
				break;
			case "POST":
				if (data) {
					executor = () => InternalHttpManager.PostAsync(fullyResolvedPath, data);
				} else {
					executor = () => InternalHttpManager.PostAsync(fullyResolvedPath);
				}
				break;
			case "PUT":
				executor = () => InternalHttpManager.PutAsync(fullyResolvedPath, data ?? "");
				break;
			case "DELETE":
				executor = () => InternalHttpManager.DeleteAsync(fullyResolvedPath);
				break;
			case "PATCH":
				executor = () => InternalHttpManager.PatchAsync(fullyResolvedPath, data ?? "");
				break;
			case "TRACE":
				throw "TRACE is not implemented for airship clients.";
			case "HEAD":
				throw "HEAD is not implemented for airship clients.";
			default:
				throw "Could not determine method when executing http: " + request.method + " : " + request.routeId;
		}

		const response = await UNITY_MAKE_REQUEST_RETRY(executor, { retryKey: request.retryKey });

		if (!response.success || response.statusCode > 299) {
			throw {
				routeId: request.routeId,
				message: response.error,
				status: response.statusCode,
			};
		}

		if (!response.data || response.data.trim() === "") return undefined as T;

		return json.decode<T>(response.data);
	};
}
