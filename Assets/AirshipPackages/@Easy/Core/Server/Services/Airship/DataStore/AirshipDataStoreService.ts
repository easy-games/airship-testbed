import {
	DataStoreServiceBridgeTopics,
	ServerBridgeApiDataDeleteKey,
	ServerBridgeApiDataGetKey,
	ServerBridgeApiDataSetKey,
} from "@Easy/Core/Server/ProtectedServices/Airship/DataStore/DataStoreService";
import { Platform } from "@Easy/Core/Shared/Airship";
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
	// Used in editor where we can't make calls to the platform APIs. This is for basic Get/Set only.
	private internalDB: Record<string, any> = {};

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
	public async GetKey<T extends object>(key: string): Promise<T | undefined> {
		this.CheckKey(key);

		if (Game.IsEditor()) {
			return this.internalDB[key];
		}

		const result = contextbridge.invoke<ServerBridgeApiDataGetKey<T>>(
			DataStoreServiceBridgeTopics.GetKey,
			LuauContext.Protected,
			key,
		);
		return result?.value;
	}

	/**
	 * Sets the data for the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param data The data to associate with the provided key.
	 * @returns The data that was associated with the provided key.
	 */
	public async SetKey<T extends object>(key: string, data: T): Promise<T> {
		this.CheckKey(key);

		if (Game.IsEditor()) {
			this.internalDB[key] = data;
			return data;
		}

		const result = contextbridge.invoke<ServerBridgeApiDataSetKey<T>>(
			DataStoreServiceBridgeTopics.SetKey,
			LuauContext.Protected,
			key,
			data,
		);
		return result?.value;
	}

	/**
	 * Allows you to update data for a key only if the data has not been changed since it was retrieved. This is good for
	 * keys which may be modified across different servers and you want to make sure that you are always operating on
	 * the most up to date data. This function is also useful when multiple servers may attempt to set the initial data for a key.
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
	 * Returning no data from the callback (undefined) will abort the update and no data will be changed.
	 *
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param callback The function that will be called to retrieve the new data value.
	 * @returns The data that was associated with the provided key.
	 */
	public async GetAndSet<T extends object>(
		key: string,
		callback: (record?: T) => Promise<T | undefined> | T | undefined,
	): Promise<T | undefined> {
		this.CheckKey(key);

		if (Game.IsEditor()) {
			warn("[Data Store] GetAndSet() is unavailable in editor.");
			return undefined as unknown as T;
		}

		const currentData = contextbridge.invoke<ServerBridgeApiDataGetKey<T>>(
			DataStoreServiceBridgeTopics.GetKey,
			LuauContext.Protected,
			key,
		);

		try {
			const newData = await callback(currentData?.value);
			if (newData === undefined) return currentData?.value;
			const setResult = contextbridge.invoke<ServerBridgeApiDataSetKey<T>>(
				DataStoreServiceBridgeTopics.SetKey,
				LuauContext.Protected,
				key,
				newData,
				currentData?.metadata.etag ?? "CREATE",
			);
			return setResult.value;
		} catch (err) {
			warn("Error retrieving updated value.", err);
			throw "Error retrieving updated value.";
		}
	}

	/**
	 * Deletes the data associated with the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @returns The data that was deleted. If no data was deleted, nothing will be returned.
	 */
	public async DeleteKey<T extends object>(key: string): Promise<T | undefined> {
		this.CheckKey(key);

		if (Game.IsEditor()) {
			const data = this.internalDB[key];
			delete this.internalDB[key];
			return data;
		}

		const result = contextbridge.invoke<ServerBridgeApiDataDeleteKey<T>>(
			DataStoreServiceBridgeTopics.DeleteKey,
			LuauContext.Protected,
			key,
		);
		return result?.value;
	}

	/**
	 * Works similarly to GetAndSet, but allows you to delete a key based on the key's data. If the callback
	 * returns true, the key will be deleted only if it has not changed. If the callback returns false, this
	 * function will return the current data value of the key. If the key is already unset, the function will
	 * return success with no data.
	 *
	 * The callback function will not be called if the key has no associated data.
	 *
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param callback The function that will be called to determine if the value should be deleted. Returning
	 * true will delete the key.
	 * @returns The data that was deleted. If no data was deleted, nothing will be returned.
	 */
	public async GetAndDelete<T extends object>(
		key: string,
		callback: (record: T) => Promise<boolean> | boolean,
	): Promise<T | undefined> {
		this.CheckKey(key);

		if (Game.IsEditor()) {
			warn("[Data Store] GetAndDelete is unavailable in editor.");
			return undefined as unknown as T;
		}

		const currentData = contextbridge.invoke<ServerBridgeApiDataGetKey<T>>(
			DataStoreServiceBridgeTopics.GetKey,
			LuauContext.Protected,
			key,
		);
		if (!currentData?.value) {
			return undefined;
		}

		try {
			const shouldDelete = await callback(currentData.value);
			if (!shouldDelete) {
				return currentData.value;
			}

			const deleteResult = contextbridge.invoke<ServerBridgeApiDataDeleteKey<T>>(
				DataStoreServiceBridgeTopics.DeleteKey,
				LuauContext.Protected,
				key,
				currentData.metadata.etag,
			);
			return deleteResult?.value;
		} catch (err) {
			warn("Error retrieving updated value.", err);
			throw "Error retrieving updated value.";
		}
	}

	/**
	 * Checks that the key is valid
	 */
	private CheckKey(key: string): void {
		if (!key || key.match("^[%w%.%:_%-]+$")[0] === undefined) {
			throw error(
				`Bad key provided (${key}). Ensure that your data store keys only include alphanumeric characters or _-.:`,
			);
		}
	}
}
