import {
	DataStoreServiceBridgeTopics,
	ServerBridgeApiDataDeleteKey,
	ServerBridgeApiDataGetKey,
	ServerBridgeApiDataSetKey,
} from "@Easy/Core/Server/ProtectedServices/Airship/DataStore/DataStoreService";
import { Platform } from "@Easy/Core/Shared/Airship";
import { ContextBridgeUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

/**
 * The Data Store provides simple key/value persistent storage.
 *
 * The data store provides durable storage that can be accessed from any game server. Data access is slower than
 * the Cache Store, but the data will never expire.
 *
 * The Data Store is good for things like user profiles or unlocks. If you want to keep track of user statistics or
 * build tradable inventory, check out the Leaderboard and PlatformInventory systems.s
 */
@Service({})
export class AirshipDataStoreService {
	constructor() {
		if (!Game.IsServer()) return;

		Platform.Server.DataStore = this;
	}

	protected OnStart(): void {}

	/**
	 * Gets the data associated with the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: ``_.:``
	 * @returns The data associated with the provided key. If no data is found, nothing is returned.
	 */
	public async GetKey<T extends object>(key: string): Promise<ReturnType<ServerBridgeApiDataGetKey<T>>> {
		this.checkKey(key);

		return await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiDataGetKey<T>>(
			DataStoreServiceBridgeTopics.GetKey,
			LuauContext.Protected,
			key,
		);
	}

	/**
	 * Sets the data for the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param data The data to associate with the provided key.
	 * @returns The data that was associated with the provided key.
	 */
	public async SetKey<T extends object>(key: string, data: T): Promise<ReturnType<ServerBridgeApiDataSetKey<T>>> {
		this.checkKey(key);

		return await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiDataSetKey<T>>(
			DataStoreServiceBridgeTopics.SetKey,
			LuauContext.Protected,
			key,
			data,
		);
	}

	/**
	 * Deletes the data associated with the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @returns The data that was deleted. If no data was deleted, nothing will be returned.
	 */
	public async DeleteKey<T extends object>(key: string): Promise<ReturnType<ServerBridgeApiDataDeleteKey<T>>> {
		this.checkKey(key);

		return await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiDataDeleteKey<T>>(
			DataStoreServiceBridgeTopics.DeleteKey,
			LuauContext.Protected,
			key,
		);
	}

	/**
	 * Checks that the key is valid
	 */
	private checkKey(key: string): void {
		if (!key || key.match("^[%w%.%:]+$")[0] === undefined) {
			throw error(
				"Bad key provided. Ensure that your data store keys only include alphanumeric characters, _, ., and :",
			);
		}
	}
}
