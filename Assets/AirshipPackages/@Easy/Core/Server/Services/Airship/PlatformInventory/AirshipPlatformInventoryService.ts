import {
	PlatformInventoryServiceBridgeTopics,
	ServerBridgeApiDeleteItem,
	ServerBridgeApiGetItems,
	ServerBridgeApiGrantItem,
	ServerBridgeApiPerformTrade,
} from "@Easy/Core/Server/ProtectedServices/Airship/PlatformInventory/PlatformInventoryService";
import { Platform } from "@Easy/Core/Shared/Airship";
import { ItemQueryParameters } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipPlatformInventory";
import { ContextBridgeUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

/**
 * Allows management of platform inventory for a player. These functions manipluate a persistent inventory
 * that the player owns. Items, Accessories, and Profile Pictures are all managed by this inventory and the
 * configurations must be registered on the https://create.airship.gg website.
 *
 * It is **_NOT_** recommended to use this inventory system for things like a game economy or persisting game
 * inventory between servers. This inventory is meant to be used for items, accessories, and profile pictures that
 * may have real money value or that players may wish to trade or sell outside of the game. This inventory is the
 * way that the game can interact with the wider platform economy.
 *
 * Some examples of potential items to include in this inventory:
 * - Weapon skins
 * - Playable characters
 * - Trading cards
 * - Content purchased with real money
 * - Content that players may want to trade or sell to other players
 */
@Service({})
export class AirshipPlatformInventoryService {
	constructor() {
		if (!Game.IsServer()) return;

		Platform.Server.Inventory = this;
	}

	protected OnStart(): void {}

	/**
	 * Grants a user the provided item.
	 */
	public async GrantItem(userId: string, classId: string): Promise<ReturnType<ServerBridgeApiGrantItem>> {
		return await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiGrantItem>(
			PlatformInventoryServiceBridgeTopics.GrantItem,
			LuauContext.Protected,
			userId,
			classId,
		);
	}

	/**
	 * Deletes the given item instance from the users inventory.
	 */
	public async DeleteItem(instanceId: string): Promise<ReturnType<ServerBridgeApiDeleteItem>> {
		return await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiDeleteItem>(
			PlatformInventoryServiceBridgeTopics.DeleteItem,
			LuauContext.Protected,
			instanceId,
		);
	}

	/**
	 * Gets all items in a users inventory.
	 */
	public async GetItems(userId: string, query?: ItemQueryParameters): Promise<ReturnType<ServerBridgeApiGetItems>> {
		return await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiGetItems>(
			PlatformInventoryServiceBridgeTopics.GetItems,
			LuauContext.Protected,
			userId,
			query,
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
	): Promise<ReturnType<ServerBridgeApiPerformTrade>> {
		return await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiPerformTrade>(
			PlatformInventoryServiceBridgeTopics.PerformTrade,
			LuauContext.Protected,
			user1,
			user2,
		);
	}
}
