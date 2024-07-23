import {
	CacheStoreServiceBridgeTopics,
	ServerBridgeApiCacheGetKey,
	ServerBridgeApiCacheSetKey,
	ServerBridgeApiCacheSetKeyTTL,
} from "@Easy/Core/Server/ProtectedServices/Airship/CacheStore/CacheStoreService";
import { Platform } from "@Easy/Core/Shared/Airship";
import { ContextBridgeUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";

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
	constructor() {
		if (!Game.IsServer()) return;

		Platform.Server.CacheStore = this;
	}

	protected OnStart(): void {}

	/**
	 * Gets the cached data for the provided key.
	 * @param key Key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param expireTimeSec The duration this key should live after being accessed in seconds. If not provided, key duration will
	 * be unchanged. The maximum expire time is 24 hours.
	 * @returns The data associated with the provided key. If no data is associated with the provided key, then nothing will be returned.
	 */
	public async GetKey<T extends object>(key: string, expireTimeSec?: number): Promise<Result<T | undefined, string>> {
		this.CheckKey(key);

		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiCacheGetKey<T>>(
			CacheStoreServiceBridgeTopics.GetKey,
			LuauContext.Protected,
			key,
			expireTimeSec,
		);
		if (!result.success) return result;
		return {
			...result,
			data: result.data?.value,
		};
	}

	/**
	 * Sets the data for the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param data The data to associate with the provided key.
	 * @param expireTimeSec The duration this key should live after being set in seconds. The maximum duration is 24 hours.
	 * @returns The data that was associated with the provided key.
	 */
	public async SetKey<T extends object>(key: string, data: T, expireTimeSec: number): Promise<Result<T, string>> {
		this.CheckKey(key);

		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiCacheSetKey<T>>(
			CacheStoreServiceBridgeTopics.SetKey,
			LuauContext.Protected,
			key,
			data,
			expireTimeSec,
		);
		if (!result.success) return result;
		return {
			...result,
			data: result.data.value,
		};
	}

	/**
	 * Deletes the data associated with the provided key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 */
	public async DeleteKey(key: string): Promise<ReturnType<ServerBridgeApiCacheSetKeyTTL>> {
		this.CheckKey(key);

		const res = await this.SetKeyTTL(key, 0);
		return res;
	}

	/**
	 * Sets a new lifetime for the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param expireTimeSec The duration this key should live in seconds. The maximum duration is 24 hours.
	 * @returns The new lifetime of the key.
	 */
	public async SetKeyTTL(key: string, expireTimeSec: number): Promise<ReturnType<ServerBridgeApiCacheSetKeyTTL>> {
		this.CheckKey(key);

		return await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiCacheSetKeyTTL>(
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
		if (!key || key.match("^[%w%.%:]+$")[0] === undefined) {
			throw error(
				"Bad key provided. Ensure that your data store keys only include alphanumeric characters, _, ., and :",
			);
		}
	}
}
