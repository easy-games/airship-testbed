import {
	AirshipItem,
	AirshipItemQueryParameters,
	AirshipInventoryTransaction,
} from "@Easy/Core/Shared/Airship/Types/AirshipPlatformInventory";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { ContentServiceClient } from "@Easy/Core/Shared/TypePackages/content-service-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum PlatformInventoryServiceBridgeTopics {
	GrantItem = "PlatformInventoryService:GrantItem",
	DeleteItem = "PlatformInventoryService:DeleteItem",
	GetItems = "PlatformInventoryService:GetItems",
	PerformTrade = "PlatformInventoryService:PerformTrade",
}

export type ServerBridgeApiGrantItem = (userId: string, classId: string) => AirshipItem;
export type ServerBridgeApiDeleteItem = (instanceId: string) => AirshipItem;
export type ServerBridgeApiGetItems = (userId: string, query?: AirshipItemQueryParameters) => AirshipItem[];
export type ServerBridgeApiPerformTrade = (
	user1: { uid: string; itemInstanceIds: string[] },
	user2: { uid: string; itemInstanceIds: string[] },
) => AirshipInventoryTransaction;

const client = new ContentServiceClient(UnityMakeRequest(AirshipUrl.ContentService));

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
		return await client.items.grantItemForResource({ uid: userId, classId });
	}

	public async DeleteItem(instanceId: string): Promise<ReturnType<ServerBridgeApiDeleteItem>> {
		return await client.items.deleteItemForResource({ itemId: instanceId });
	}

	public async GetItems(userId: string, query?: AirshipItemQueryParameters): Promise<ReturnType<ServerBridgeApiGetItems>> {
		return await client.items.getUserInventoryForResource({
			params: {
				uid: userId,
			},
			query: {
				queryType: query?.queryType,
				query: query?.queryType === "tag" ? query?.tags : query?.classIds,
				resourceIds: query?.resourceIds,
			},
		});
	}

	public async PerformTrade(
		user1: { uid: string; itemInstanceIds: string[] },
		user2: { uid: string; itemInstanceIds: string[] },
	): Promise<ReturnType<ServerBridgeApiPerformTrade>> {
		return await client.itemTransactions.trade({
			leftTradeHalf: user1,
			rightTradeHalf: user2,
		});
	}

	protected OnStart(): void { }
}
