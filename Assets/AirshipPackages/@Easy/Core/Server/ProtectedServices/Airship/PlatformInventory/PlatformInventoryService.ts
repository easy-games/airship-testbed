import { ItemQueryParameters } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipPlatformInventory";
import { ItemInstanceDto, Transaction } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipPlatformInventory";
import { PlatformInventoryUtil } from "@Easy/Core/Shared/Airship/Util/PlatformInventoryUtil";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { RetryHttp } from "@Easy/Core/Shared/Http/HttpRetry";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum PlatformInventoryServiceBridgeTopics {
	GrantItem = "PlatformInventoryService:GrantItem",
	DeleteItem = "PlatformInventoryService:DeleteItem",
	GetItems = "PlatformInventoryService:GetItems",
	PerformTrade = "PlatformInventoryService:PerformTrade",
}

export type ServerBridgeApiGrantItem = (userId: string, classId: string) => ItemInstanceDto;
export type ServerBridgeApiDeleteItem = (instanceId: string) => ItemInstanceDto;
export type ServerBridgeApiGetItems = (userId: string, query?: ItemQueryParameters) => ItemInstanceDto[];
export type ServerBridgeApiPerformTrade = (
	user1: { uid: string; itemInstanceIds: string[] },
	user2: { uid: string; itemInstanceIds: string[] },
) => Transaction;

@Service({})
export class ProtectedPlatformInventoryService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiGrantItem>(
			PlatformInventoryServiceBridgeTopics.GrantItem,
			(_, userId, classId) => {
				return this.GrantItem(userId, classId).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiDeleteItem>(
			PlatformInventoryServiceBridgeTopics.DeleteItem,
			(_, instanceId) => {
				return this.DeleteItem(instanceId).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiGetItems>(
			PlatformInventoryServiceBridgeTopics.GetItems,
			(_, userId, query) => {
				return this.GetItems(userId, query).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiPerformTrade>(
			PlatformInventoryServiceBridgeTopics.PerformTrade,
			(_, user1, user2) => {
				return this.PerformTrade(user1, user2).expect();
			},
		);
	}

	public async GrantItem(userId: string, classId: string): Promise<ReturnType<ServerBridgeApiGrantItem>> {
		const res = await RetryHttp(
			() => InternalHttpManager.PostAsync(
				`${AirshipUrl.ContentService}/items/uid/${userId}/class-id/${classId}`,
				"",
			),
			{ retryKey: "post/content-service/items/uid/:userId/class-id/:classId" },
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return json.decode(res.data) as ItemInstanceDto;
	}

	public async DeleteItem(instanceId: string): Promise<ReturnType<ServerBridgeApiDeleteItem>> {
		const res = await RetryHttp(
			() => InternalHttpManager.DeleteAsync(`${AirshipUrl.ContentService}/items/item-id/${instanceId}`),
			{ retryKey: "delete/content-service/items/item-id/:instanceId" },
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return json.decode(res.data) as ItemInstanceDto;
	}

	public async GetItems(userId: string, query?: ItemQueryParameters): Promise<ReturnType<ServerBridgeApiGetItems>> {
		const res = await RetryHttp(
			() => InternalHttpManager.GetAsync(
				`${AirshipUrl.ContentService}/items/uid/${userId}?=${PlatformInventoryUtil.BuildItemQueryString(query)}`,
			),
			{ retryKey: "get/content-service/items/uid/:userId" },
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		if (!res.data) {
			return [];
		}

		return json.decode(res.data) as ItemInstanceDto[];
	}

	public async PerformTrade(
		user1: { uid: string; itemInstanceIds: string[] },
		user2: { uid: string; itemInstanceIds: string[] },
	): Promise<ReturnType<ServerBridgeApiPerformTrade>> {
		const res = await RetryHttp(
			() => InternalHttpManager.PostAsync(
				`${AirshipUrl.ContentService}/transactions/trade`,
				json.encode({
					leftTradeHalf: user1,
					rightTradeHalf: user2,
				}),
			),
			{ retryKey: "post/content-service/transactions/trade" },
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return json.decode(res.data) as Transaction;
	}

	protected OnStart(): void {}
}
