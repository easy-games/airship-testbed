import {
	DataStoreRecord,
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
	 * Allows you to update data for a key only if the data has not been changed since it was retrieved. This is good for
	 * keys which may be modified across diffrerent servers and you want to make sure that you are always operating on
	 * the most up to date data. This funciton is also useful when multiple servers may attempt to set the initial data for a key.
	 * It will ensure that only one set operation succeeds in writing the intial data.
	 *
	 * This function works by first retrieving the data associated with a key, then passing that data to the provided callback.
	 * The return value of the provided callback will be used as the new data for the key. If a change has been made to the data
	 * associated with the key between the get operation and the set operation, this function will fail with a conflict error.
	 *
	 * If no data is associated with the key initially, the callback will be provided no data, and the return value will be
	 * associated with the provided key. If data was associated with the key between the get operation and the set operation,
	 * this function will fail with a conflict error.
	 *
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param callback The function that will be called to retrieve the new data value.
	 * @returns The data that was associated with the provided key.
	 */
	public async GetAndSet<R extends object>(
		key: string,
		callback: (record?: DataStoreRecord<R>) => R,
	): Promise<ReturnType<ServerBridgeApiDataSetKey<R>>> {
		const currentData = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiDataGetKey<R>>(
			DataStoreServiceBridgeTopics.GetKey,
			LuauContext.Protected,
			key,
		);
		if (!currentData.success) return currentData;

		try {
			const newData = callback(currentData.data);
			const setResult = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiDataSetKey<R>>(
				DataStoreServiceBridgeTopics.SetKey,
				LuauContext.Protected,
				key,
				newData,
				currentData.data?.metadata.etag ?? "CREATE",
			);
			if (!setResult.success) return setResult;
			return setResult;
		} catch (err) {
			warn("Error retrieving updated value.", err);
			return {
				success: false,
				error: "Error retrieving updated value.",
			};
		}
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
