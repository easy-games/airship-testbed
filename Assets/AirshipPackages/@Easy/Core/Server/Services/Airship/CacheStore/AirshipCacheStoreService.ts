import {
	CacheStoreServiceBridgeTopics,
	ServerBridgeApiCacheDeleteKey,
	ServerBridgeApiCacheGetKey,
	ServerBridgeApiCacheSetKey,
	ServerBridgeApiCacheSetKeyTTL,
} from "@Easy/Core/Server/ProtectedServices/Airship/CacheStore/CacheStoreService";
import { Platform } from "@Easy/Core/Shared/Airship";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import EditorCacheStore from "./EditorCacheStore";

/**
 * The Cache Store provides simple key/value cache storage.
 *
 * The Cache Store provides non-durable storage that can be accessed from any game server. Data access is faster than
 * the Data Store, but the data will expire if it is not accessed frequently enough. Cached keys can live for up to 24 hours
 * without being accessed.
 *
 * The Cache Store is good for things like queue cooldowns or share codes. If you want your data to be persistent, check
 * out the Data Store.
 */
@Service({})
export class AirshipCacheStoreService {
	private readonly editorCacheStore: EditorCacheStore;

	constructor() {
		if (!Game.IsServer()) return;
		if (Game.IsEditor()) {
			this.editorCacheStore = new EditorCacheStore();
		}

		Platform.Server.CacheStore = this;
	}

	protected OnStart(): void {}

	/**
	 * Gets the cached data for the provided key.
	 * @param key Key to use. Keys must be alphanumeric and may include the following symbols: _-.:
	 * @param expireTimeSec The duration this key should live after being accessed in seconds. If not provided, key duration will
	 * be unchanged. The maximum expire time is 24 hours.
	 * @returns The data associated with the provided key. If no data is associated with the provided key, then nothing will be returned.
	 */
	public async GetKey<T>(key: string, expireTimeSec?: number): Promise<T | undefined> {
		this.CheckKey(key);

		if (Game.IsEditor()) {
			return this.editorCacheStore.GetKey<T>(key, expireTimeSec);
		}

		const result = contextbridge.invoke<ServerBridgeApiCacheGetKey<T>>(
			CacheStoreServiceBridgeTopics.GetKey,
			LuauContext.Protected,
			key,
			expireTimeSec,
		);
		return result?.value;
	}

	/**
	 * Sets the data for the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _-.:
	 * @param data The data to associate with the provided key.
	 * @param expireTimeSec The duration this key should live after being set in seconds. The maximum duration is 24 hours.
	 * @returns The data that was associated with the provided key.
	 */
	public async SetKey<T>(key: string, data: T, expireTimeSec: number): Promise<T | undefined> {
		this.CheckKey(key);

		if (Game.IsEditor()) {
			return this.editorCacheStore.SetKey(key, data, expireTimeSec);
		}

		const result = contextbridge.invoke<ServerBridgeApiCacheSetKey<T>>(
			CacheStoreServiceBridgeTopics.SetKey,
			LuauContext.Protected,
			key,
			data,
			expireTimeSec,
		);
		return result?.value;
	}

	/**
	 * Deletes the data associated with the provided key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _-.:
	 */
	public async DeleteKey<T = unknown>(key: string, returnValue: boolean = false): Promise<T | undefined> {
		this.CheckKey(key);

		if (Game.IsEditor()) {
			return this.editorCacheStore.DeleteKey<T>(key, returnValue);
		}

		const result = contextbridge.invoke<ServerBridgeApiCacheDeleteKey<T>>(
			CacheStoreServiceBridgeTopics.DeleteKey,
			LuauContext.Protected,
			key,
			returnValue,
		);
		return result?.value;
	}

	/**
	 * Sets a new lifetime for the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _-.:
	 * @param expireTimeSec The duration this key should live in seconds. The maximum duration is 24 hours.
	 * @returns The new lifetime of the key.
	 */
	public async SetKeyTTL(key: string, expireTimeSec: number): Promise<number> {
		this.CheckKey(key);
		if (Game.IsEditor()) {
			return this.editorCacheStore.SetKeyTTL(key, expireTimeSec);
		}

		return contextbridge.invoke<ServerBridgeApiCacheSetKeyTTL>(
			CacheStoreServiceBridgeTopics.SetKeyTTL,
			LuauContext.Protected,
			key,
			expireTimeSec,
		);
	}

	/**
	 * Checks that the key is valid. Throws an error if not valid.
	 */
	private CheckKey(key: string): void {
		if (!key || key.match("^[%w%.%:_%-]+$")[0] === undefined) {
			throw `Bad key provided (${key}). Ensure that your cache store keys only include alphanumeric characters or _-.:`;
		}
	}
}
