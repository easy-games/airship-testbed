import {
	PlatformInventoryServiceBridgeTopics,
	ServerBridgeApiDeleteItem,
	ServerBridgeApiGetEquippedOutfitByUserId,
	ServerBridgeApiGetItems,
	ServerBridgeApiGrantItem,
	ServerBridgeApiPerformTrade,
} from "@Easy/Core/Server/ProtectedServices/Airship/PlatformInventory/PlatformInventoryService";
import { Platform } from "@Easy/Core/Shared/Airship";
import { ItemQueryParameters } from "@Easy/Core/Shared/Airship/Types/Inputs/PlatformInventory";
import { ItemInstanceDto, OutfitDto, Transaction } from "@Easy/Core/Shared/Airship/Types/Outputs/PlatformInventory";
import { AirshipUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";

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
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiGrantItem>(
			PlatformInventoryServiceBridgeTopics.GrantItem,
			userId,
			classId,
		);
	}

	/**
	 * Deletes the given item instance from the users inventory.
	 */
	public async DeleteItem(instanceId: string): Promise<Result<ItemInstanceDto, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiDeleteItem>(
			PlatformInventoryServiceBridgeTopics.DeleteItem,
			instanceId,
		);
	}

	/**
	 * Gets all items in a users inventory.
	 */
	public async GetItems(userId: string, query?: ItemQueryParameters): Promise<Result<ItemInstanceDto[], undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiGetItems>(
			PlatformInventoryServiceBridgeTopics.GetItems,
			userId,
			query,
		);
	}

	/**
	 * Gets the users currently equipped outfit.
	 */
	public async GetEquippedOutfitByUserId(userId: string): Promise<Result<OutfitDto, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiGetEquippedOutfitByUserId>(
			PlatformInventoryServiceBridgeTopics.GetEquippedOutfitByUserId,
			userId,
		);
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
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiPerformTrade>(
			PlatformInventoryServiceBridgeTopics.PerformTrade,
			user1,
			user2,
		);
	}
}
