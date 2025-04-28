import { ItemQueryParameters } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipPlatformInventory";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { HttpRetryInstance } from "@Easy/Core/Shared/Http/HttpRetry";
import {
	ContentServiceBaseClient,
	ContentServiceItems,
	ContentServicePrisma,
} from "@Easy/Core/Shared/TypePackages/content-service-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum PlatformInventoryServiceBridgeTopics {
	GrantItem = "PlatformInventoryService:GrantItem",
	DeleteItem = "PlatformInventoryService:DeleteItem",
	GetItems = "PlatformInventoryService:GetItems",
	PerformTrade = "PlatformInventoryService:PerformTrade",
}

export type ServerBridgeApiGrantItem = (userId: string, classId: string) => ContentServiceItems.SelectedItem;
export type ServerBridgeApiDeleteItem = (instanceId: string) => ContentServiceItems.SelectedItem;
export type ServerBridgeApiGetItems = (
	userId: string,
	query?: ItemQueryParameters,
) => ContentServiceItems.SelectedItem[];
export type ServerBridgeApiPerformTrade = (
	user1: { uid: string; itemInstanceIds: string[] },
	user2: { uid: string; itemInstanceIds: string[] },
) => ContentServicePrisma.Transaction;

@Service({})
export class ProtectedPlatformInventoryService extends ContentServiceBaseClient {
	constructor() {
		super(UnityMakeRequest(AirshipUrl.ContentService, HttpRetryInstance()));

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
		return await this.items.grantItemForResource({ uid: userId, classId }, { retryKey: "GrantItem" });
	}

	public async DeleteItem(instanceId: string): Promise<ReturnType<ServerBridgeApiDeleteItem>> {
		return await this.items.deleteItemForResource({ itemId: instanceId }, { retryKey: "DeleteItem" });
	}

	public async GetItems(userId: string, query?: ItemQueryParameters): Promise<ReturnType<ServerBridgeApiGetItems>> {
		return await this.items.getUserInventoryForResource(
			{
				params: {
					uid: userId,
				},
				query: {
					queryType: query?.queryType,
					query: query?.queryType === "tag" ? query?.tags : query?.classIds,
					resourceIds: query?.resourceIds,
				},
			},
			{ retryKey: "GetItems" },
		);
	}

	public async PerformTrade(
		user1: { uid: string; itemInstanceIds: string[] },
		user2: { uid: string; itemInstanceIds: string[] },
	): Promise<ReturnType<ServerBridgeApiPerformTrade>> {
		return await this.itemTransactions.trade(
			{
				leftTradeHalf: user1,
				rightTradeHalf: user2,
			},
			{ retryKey: "PerformTrade" },
		);
	}

	protected OnStart(): void {}
}
