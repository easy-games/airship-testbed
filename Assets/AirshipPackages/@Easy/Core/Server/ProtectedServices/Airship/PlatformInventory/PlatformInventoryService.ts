import { ItemQueryParameters } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipPlatformInventory";
import { ItemInstanceDto, Transaction } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipPlatformInventory";
import { PlatformInventoryUtil } from "@Easy/Core/Shared/Airship/Util/PlatformInventoryUtil";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

export const enum PlatformInventoryServiceBridgeTopics {
	GrantItem = "PlatformInventoryService:GrantItem",
	DeleteItem = "PlatformInventoryService:DeleteItem",
	GetItems = "PlatformInventoryService:GetItems",
	PerformTrade = "PlatformInventoryService:PerformTrade",
}

export type ServerBridgeApiGrantItem = (userId: string, classId: string) => Result<ItemInstanceDto, string>;
export type ServerBridgeApiDeleteItem = (instanceId: string) => Result<ItemInstanceDto, string>;
export type ServerBridgeApiGetItems = (
	userId: string,
	query?: ItemQueryParameters,
) => Result<ItemInstanceDto[], string>;
export type ServerBridgeApiPerformTrade = (
	user1: { uid: string; itemInstanceIds: string[] },
	user2: { uid: string; itemInstanceIds: string[] },
) => Result<Transaction, string>;

@Service({})
export class ProtectedPlatformInventoryService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiGrantItem>(
			PlatformInventoryServiceBridgeTopics.GrantItem,
			(_, userId, classId) => {
				const [success, result] = this.GrantItem(userId, classId).await();
				if (!success) {
					return { success: false, error: "Unable to complete request." };
				}
				return result;
			},
		);

		contextbridge.callback<ServerBridgeApiDeleteItem>(
			PlatformInventoryServiceBridgeTopics.DeleteItem,
			(_, instanceId) => {
				const [success, result] = this.DeleteItem(instanceId).await();
				if (!success) {
					return { success: false, error: "Unable to complete request." };
				}
				return result;
			},
		);

		contextbridge.callback<ServerBridgeApiGetItems>(
			PlatformInventoryServiceBridgeTopics.GetItems,
			(_, userId, query) => {
				const [success, result] = this.GetItems(userId, query).await();
				if (!success) {
					return { success: false, error: "Unable to complete request." };
				}
				return result;
			},
		);

		contextbridge.callback<ServerBridgeApiPerformTrade>(
			PlatformInventoryServiceBridgeTopics.PerformTrade,
			(_, user1, user2) => {
				const [success, result] = this.PerformTrade(user1, user2).await();
				if (!success) {
					return { success: false, error: "Unable to complete request." };
				}
				return result;
			},
		);
	}

	public async GrantItem(userId: string, classId: string): Promise<ReturnType<ServerBridgeApiGrantItem>> {
		const res = InternalHttpManager.PostAsync(
			`${AirshipUrl.ContentService}/items/uid/${userId}/class-id/${classId}`,
			"",
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: res.error,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	public async DeleteItem(instanceId: string): Promise<ReturnType<ServerBridgeApiDeleteItem>> {
		const res = InternalHttpManager.DeleteAsync(`${AirshipUrl.ContentService}/items/item-id/${instanceId}`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: res.error,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	public async GetItems(userId: string, query?: ItemQueryParameters): Promise<ReturnType<ServerBridgeApiGetItems>> {
		const res = InternalHttpManager.GetAsync(
			`${AirshipUrl.ContentService}/items/uid/${userId}?=${PlatformInventoryUtil.BuildItemQueryString(query)}`,
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: res.error,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	public async PerformTrade(
		user1: { uid: string; itemInstanceIds: string[] },
		user2: { uid: string; itemInstanceIds: string[] },
	): Promise<ReturnType<ServerBridgeApiPerformTrade>> {
		const res = InternalHttpManager.PostAsync(
			`${AirshipUrl.ContentService}/transactions/trade`,
			EncodeJSON({
				leftTradeHalf: user1,
				rightTradeHalf: user2,
			}),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: res.error,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	protected OnStart(): void {}
}
