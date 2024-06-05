import { ItemQueryParameters } from "../Types/Inputs/AirshipPlatformInventory";

export class PlatformInventoryUtil {
	/** Builds the query string for item queries. */
	public static BuildItemQueryString(query?: ItemQueryParameters): string {
		if (!query) return "";

		let queryString = `queryType=${query.queryType}`;

		if (query.resourceIds && query.resourceIds.size() > 0) {
			queryString += `&resourceIds[]=${query.resourceIds.join("&resourceIds[]=")}`;
		}

		let ids = [];
		if (query.queryType === "tag") {
			ids = query.tags;
		} else {
			ids = query.classIds;
		}

		if (ids.size() > 0) {
			queryString += `&query[]=${ids.join("&query[]=")}`;
		}

		return queryString;
	}
}
