import { ItemQueryParameters } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipPlatformInventory";
import {
	ItemInstanceDto,
	OutfitDto,
	Transaction,
} from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipPlatformInventory";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

export enum PlatformInventoryServiceBridgeTopics {
	GrantItem = "PlatformInventoryService:GrantItem",
	DeleteItem = "PlatformInventoryService:DeleteItem",
	GetItems = "PlatformInventoryService:GetItems",
	GetEquippedOutfitByUserId = "PlatformInventoryService:GetEquippedOutfitByUserId",
	PerformTrade = "PlatformInventoryService:PerformTrade",
}

export type ServerBridgeApiGrantItem = (userId: string, classId: string) => Result<ItemInstanceDto, undefined>;
export type ServerBridgeApiDeleteItem = (instanceId: string) => Result<ItemInstanceDto, undefined>;
export type ServerBridgeApiGetItems = (
	userId: string,
	query?: ItemQueryParameters,
) => Result<ItemInstanceDto[], undefined>;
export type ServerBridgeApiGetEquippedOutfitByUserId = (userId: string) => Result<OutfitDto, undefined>;
export type ServerBridgeApiPerformTrade = (
	user1: { uid: string; itemInstanceIds: string[] },
	user2: { uid: string; itemInstanceIds: string[] },
) => Result<Transaction, undefined>;

@Service({})
export class PlatformInventoryService implements OnStart {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiGrantItem>(
			PlatformInventoryServiceBridgeTopics.GrantItem,
			(_, userId, classId) => {
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
			},
		);

		contextbridge.callback<ServerBridgeApiDeleteItem>(
			PlatformInventoryServiceBridgeTopics.DeleteItem,
			(_, instanceId) => {
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
			},
		);

		contextbridge.callback<ServerBridgeApiGetItems>(
			PlatformInventoryServiceBridgeTopics.GetItems,
			(_, userId, query) => {
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
			},
		);

		contextbridge.callback<ServerBridgeApiPerformTrade>(
			PlatformInventoryServiceBridgeTopics.PerformTrade,
			(_, user1, user2) => {
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
			},
		);
	}

	OnStart(): void {}

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
