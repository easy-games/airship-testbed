import { HttpCallback, HttpRetryInstance } from "../Http/HttpRetry";
import { ArrayUtil } from "../Util/ArrayUtil";
import { entries } from "../Util/ObjectUtils";
// note (Corey Shupe):
//  These types could come from any type package.
import { HttpRequestParams, MakeRequest } from "./content-service-types";

export function encodeURIComponent(component: string): string {
	const [encodedComponent] = string.gsub(component, "[^%a%d%-%_%.!~%*%'%(%)]", (value) => {
		const bytes = string.byte(value, 1, value.size());
		let encoded = "";

		for (const byte of bytes) {
			encoded += string.format("%%%02X", byte);
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

		// todo: ask about this
		if (typeIs(value, "vector")) {
			const arrType = value as unknown as (string | number | boolean)[];
			queryString += `${encodedKey}[]=${arrType.map(tostring).map(encodeURIComponent).join(`&${encodedKey}[]=`)}`;
		} else {
			queryString += `${tostring(key)}=${encodeURIComponent(tostring(value))}`;
		}
	}
}

const UNITY_MAKE_REQUEST_RETRY = HttpRetryInstance();

export type UnityMakeRequestError = { message: string; status: number };

export function isUnityMakeRequestError(err: unknown): err is UnityMakeRequestError {
	if (!err) return false;
	const typedErr = err as Partial<UnityMakeRequestError>;
	return typedErr.message !== undefined && typedErr.status !== undefined;
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
				throw error("TRACE is not implemented for airship clients.");
			case "HEAD":
				throw error("HEAD is not implemented for airship clients.");
			default:
				throw error("Could not determine method when executing http.");
		}

		const response = await UNITY_MAKE_REQUEST_RETRY(executor, { retryKey: request.retryKey });

		if (!response.success || response.statusCode > 299) {
			warn(
				`Unable to complete request ${request.routeId}.\n Status Code:  ${response.statusCode}.\n `,
				response.error,
			);
			throw { message: response.error, status: response.statusCode };
		}

		return json.decode<T>(response.data);
	};
}
