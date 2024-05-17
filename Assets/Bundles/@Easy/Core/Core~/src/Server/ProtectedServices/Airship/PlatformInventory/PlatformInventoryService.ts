import { Platform } from "@Easy/Core/Shared/Airship";
import { ItemQueryParameters } from "@Easy/Core/Shared/Airship/Types/Inputs/PlatformInventory";
import { ItemInstanceDto, OutfitDto, Transaction } from "@Easy/Core/Shared/Airship/Types/Outputs/PlatformInventory";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

@Service({})
export class PlatformInventoryService implements OnStart {
	constructor() {
		if (Game.IsServer()) Platform.server.inventory = this;
	}

	OnStart(): void {}

	/**
	 * Grants a user the provided item.
	 */
	public async GrantItem(userId: string, classId: string): Promise<Result<ItemInstanceDto, undefined>> {
		const res = InternalHttpManager.PostAsync(
			`${AirshipUrl.ContentService}/items/uid/${userId}/class-id/${classId}`,
			"",
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	/**
	 * Deletes the given item instance from the users inventory.
	 */
	public async DeleteItem(instanceId: string): Promise<Result<ItemInstanceDto, undefined>> {
		const res = InternalHttpManager.DeleteAsync(`${AirshipUrl.ContentService}/items/item-id/${instanceId}`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	/**
	 * Gets all items in a users inventory.
	 */
	public async GetItems(userId: string, query?: ItemQueryParameters): Promise<Result<ItemInstanceDto[], undefined>> {
		const res = InternalHttpManager.GetAsync(
			`${AirshipUrl.ContentService}/items/uid/${userId}?=${this.BuildItemQueryString(query)}`,
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	/**
	 * Gets the users currently equipped outfit.
	 */
	public async GetEquippedOutfitByUserId(userId: string): Promise<Result<OutfitDto, undefined>> {
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.ContentService}/outfits/uid/${userId}/equipped`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	/**
	 * Performs a trade between two players. Trades are atomic, if the transaction does not succeed, no
	 * items are lost or modified.
	 *
	 * @param user1 The first user and items from their inventory that will be traded to the second user.
	 * @param user2 The second user and items from their inventory that will be traded to the first user.
	 */
	public async PerformTrade(
		user1: { uid: string; itemInstanceIds: string[] },
		user2: { uid: string; itemInstanceIds: string[] },
	): Promise<Result<Transaction, undefined>> {
		const res = InternalHttpManager.PostAsync(
			`${AirshipUrl.ContentService}/transactions/trade`,
			EncodeJSON({
				leftTradeHalf: user1,
				rightTradeHalf: user2,
			}),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	private BuildItemQueryString(query?: ItemQueryParameters): string {
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
