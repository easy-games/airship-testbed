import { HttpRetryInstance } from "../Http/HttpRetry";
import { entries } from "../Util/ObjectUtils";
// note (Corey Shupe):
//  These types could come from any type package.
import { HttpRequestParams, MakeRequest } from "./content-service-types";

export function encodeURIComponent(component: string): string {
	// todo
	return component;
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
		const queryString = request.query === undefined ? "" : encodeQueryString(request.query);
		const fullyResolvedPath = pathWithoutQueryString + queryString;
		const httpRetry = UNITY_MAKE_REQUEST_RETRY;

		let response: HttpResponse;
		switch (request.method) {
			case "GET":
				response = await httpRetry(() => InternalHttpManager.GetAsync(fullyResolvedPath), {
					retryKey: request.retryKey,
				});
				break;
			// todo
			default:
				throw error("Could not determine method when executing http.");
		}

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
