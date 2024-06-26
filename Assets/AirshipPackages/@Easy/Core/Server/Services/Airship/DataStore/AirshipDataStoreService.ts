import {
	DataStoreServiceBridgeTopics,
	ServerBridgeApiDataDeleteKey,
	ServerBridgeApiDataGetKey,
	ServerBridgeApiDataSetKey,
} from "@Easy/Core/Server/ProtectedServices/Airship/DataStore/DataStoreService";
import { Platform } from "@Easy/Core/Shared/Airship";
import { AirshipUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";

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
	public async GetKey<T extends object>(key: string): Promise<Result<T | undefined, undefined>> {
		this.checkKey(key);

		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiDataGetKey<T>>(
			DataStoreServiceBridgeTopics.GetKey,
			key,
		);
	}

	/**
	 * Sets the data for the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param data The data to associate with the provided key.
	 * @returns The data that was associated with the provided key.
	 */
	public async SetKey<T extends object>(key: string, data: T): Promise<Result<T, undefined>> {
		this.checkKey(key);

		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiDataSetKey<T>>(
			DataStoreServiceBridgeTopics.SetKey,
			key,
			data,
		);
	}

	/**
	 * Deletes the data associated with the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @returns The data that was deleted. If no data was deleted, nothing will be returned.
	 */
	public async DeleteKey<T extends object>(key: string): Promise<Result<T | undefined, undefined>> {
		this.checkKey(key);

		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiDataDeleteKey<T>>(
			DataStoreServiceBridgeTopics.DeleteKey,
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
