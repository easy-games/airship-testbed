import {
	DataStoreServiceBridgeTopics,
	ServerBridgeApiDataDeleteKey,
	ServerBridgeApiDataGetKey,
	ServerBridgeApiDataGetLockData,
	ServerBridgeApiDataSetKey,
	ServerBridgeApiDataSetLock,
} from "@Easy/Core/Server/ProtectedServices/Airship/DataStore/DataStoreService";
import { Platform } from "@Easy/Core/Shared/Airship";
import {
	AirshipDataStoreLockData,
	AirshipDataStoreLockMode,
} from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipDataStore";
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
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: ``_-.:``
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
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _-.:
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
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _-.:
	 * @param callback The function that will be called to retrieve the new data value.
	 * @returns The data that was associated with the provided key.
	 */
	public async GetAndSetKey<T extends object>(
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
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _-.:
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
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _-.:
	 * @param callback The function that will be called to determine if the value should be deleted. Returning
	 * true will delete the key.
	 * @returns The data that was deleted. If no data was deleted, nothing will be returned.
	 */
	public async GetAndDeleteKey<T extends object>(
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
	 * Locks a data store key so that only the server that locked the key can write to it.
	 * The lock mode can be specified to allow reads from other servers on locked keys.
	 * Locks time out after 24 hours.
	 *
	 * This function performs additional checks and attempts to steal the lock if it can
	 * be stolen safely.
	 *
	 * A lock can be stolen safely if the server that owns the lock is offline.
	 *
	 * @param key The key to lock.
	 * @param mode The mode to lock the key with. Defaults to ReadWrite which disables both
	 * reading and writing on all other servers.
	 *
	 * @returns True if the key was successfully locked to this server. False otherwise.
	 */
	public async LockKeyOrStealSafely(
		key: string,
		mode: AirshipDataStoreLockMode = AirshipDataStoreLockMode.ReadWrite,
	): Promise<boolean> {
		this.CheckKey(key);

		if (Game.IsEditor()) {
			warn("[Data Store] LockKey() is unavailable in editor.");
			return true;
		}

		const gotLock = contextbridge.invoke<ServerBridgeApiDataSetLock>(
			DataStoreServiceBridgeTopics.SetLock,
			LuauContext.Protected,
			key,
			mode,
		);

		if (gotLock) return true;

		const lockData = await this.GetLockDataForKey(key);
		if (!lockData.locked) {
			// Try once more to acquire lock since there's no lock data for the key.
			return contextbridge.invoke<ServerBridgeApiDataSetLock>(
				DataStoreServiceBridgeTopics.SetLock,
				LuauContext.Protected,
				key,
				mode,
			);
		}

		const server = await Platform.Server.ServerManager.GetServer(lockData.lockData.ownerId);
		if (server) {
			// Server that owns the lock is online. Assume that they are still using it.
			return false;
		}

		// Attempt to steal the lock from the inactive server.
		return contextbridge.invoke<ServerBridgeApiDataSetLock>(
			DataStoreServiceBridgeTopics.SetLock,
			LuauContext.Protected,
			key,
			mode,
			lockData.lockData.ownerId,
		);
	}

	/**
	 * Locks a data store key so that only the server that locked the key can write to it.
	 * The lock mode can be specified to allow reads from other servers on locked keys.
	 * Locks time out after 24 hours.
	 *
	 * This function does not perform any additional actions in attempt to aquire the lock.
	 *
	 * @param key The key to lock.
	 * @param mode The mode to lock the key with. Defaults to ReadWrite which disables both
	 * reading and writing on all other servers.
	 * @param stealFromOwnerId Steals the lock from this ownerId if the key is already locked.
	 * @returns True if the key was successfully locked to this server. False otherwise.
	 */
	public async LockKey(
		key: string,
		mode: AirshipDataStoreLockMode = AirshipDataStoreLockMode.ReadWrite,
		stealFromOwnerId?: string,
	): Promise<boolean> {
		this.CheckKey(key);

		if (Game.IsEditor()) {
			warn("[Data Store] LockKey() is unavailable in editor.");
			return true;
		}

		return contextbridge.invoke<ServerBridgeApiDataSetLock>(
			DataStoreServiceBridgeTopics.SetLock,
			LuauContext.Protected,
			key,
			mode,
			stealFromOwnerId,
		);
	}

	/**
	 * Unlocks a data store key so that all servers can read and write the key. If the
	 * current game server does not own the lock, this operation will fail, unless you
	 * steal the lock by providing the current ownerId of the lock.
	 * @param key The key you wish to unlock.
	 * @param stealFromOwnerId The ownerId of the current lock holder. Only provide this parameter if you want to steal the lock.
	 * @returns True if the key was successfully unlocked. False otherwise.
	 */
	public async UnlockKey(key: string, stealFromOwnerId?: string): Promise<boolean> {
		this.CheckKey(key);

		if (Game.IsEditor()) {
			warn("[Data Store] UnlockKey() is unavailable in editor.");
			return true;
		}

		return contextbridge.invoke<ServerBridgeApiDataSetLock>(
			DataStoreServiceBridgeTopics.SetLock,
			LuauContext.Protected,
			key,
			undefined,
			stealFromOwnerId,
		);
	}

	/**
	 * Returns information about the current lock holder for a given key. You can use this information to
	 * decide if you wish to steal a lock.
	 * @param key The key to get lock information for.
	 * @returns The lock information.
	 */
	public async GetLockDataForKey(key: string): Promise<AirshipDataStoreLockData> {
		this.CheckKey(key);

		if (Game.IsEditor()) {
			warn("[Data Store] GetLockDataForKey() is unavailable in editor.");
			return { locked: false };
		}

		return contextbridge.invoke<ServerBridgeApiDataGetLockData>(
			DataStoreServiceBridgeTopics.GetLockData,
			LuauContext.Protected,
			key,
		);
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
