import { HttpRetryCallback } from "../Http/HttpRetry";
import { entries } from "../Util/ObjectUtils";
// note (Corey Shupe):
//  These types could come from any type package.
import { HttpRequestParams, MakeRequest } from "./content-service-types";

export function encodeURIComponent(component: string): string {
	return component;
}

function buildQueryString(query: Required<HttpRequestParams>["query"]) {
	let queryString = "";
	for (const [key, value] of entries(query)) {
		if (queryString === "") {
			queryString = "?";
		} else {
			queryString += "&";
		}

		if (typeIs(value, "vector")) {
			const arrType = value as unknown as (string | number | boolean)[];
			queryString += `${tostring(key)}[]=${arrType
				.map(tostring)
				.map(encodeURIComponent)
				.join(`&${tostring(key)}[]=`)}`;
		} else {
			queryString += `${tostring(key)}=${encodeURIComponent(tostring(value))}`;
		}
	}
}

export function UnityMakeRequest(baseUrl: string, httpRetry: HttpRetryCallback): MakeRequest {
	return async <T>(request: HttpRequestParams) => {
		const pathWithoutQueryString = baseUrl + request.path;
		const queryString = request.query === undefined ? "" : buildQueryString(request.query);
		const fullyResolvedPath = pathWithoutQueryString + queryString;

		let response: HttpResponse;
		switch (request.method) {
			case "GET":
				response = await httpRetry(() => InternalHttpManager.GetAsync(fullyResolvedPath), {
					retryKey: request.retryKey,
				});
				break;
			default:
				throw error("Could not determine method when executing http.");
		}

		if (!response.success || response.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${response.statusCode}.\n`, response.error);
			throw response.error;
		}

		return json.decode<T>(response.data);
	};
}
