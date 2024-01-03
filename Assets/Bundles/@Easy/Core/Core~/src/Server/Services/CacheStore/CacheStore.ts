import { Service, OnStart } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "Shared/json";

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
export class CacheStore implements OnStart {
	/** Reflects backend data-store-service settings */
	private maxExpireSec = 60 * 60 * 24; // 24h in seconds

	OnStart(): void {}

	/**
	 * Gets the cached data for the provided key.
	 * @param key Key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param expireTimeSec The duration this key should live after being accessed in seconds. If not provided, key duration will
	 * be unchanged. The maximum expire time is 24 hours.
	 * @returns The data associated with the provided key. If no data is associated with the provided key, then nothing will be returned.
	 */
	public async GetCacheKey<T extends object>(key: string, expireTimeSec?: number): Promise<T | void> {
		this.checkKey(key);

		const query: string =
			expireTimeSec !== undefined ? `?expiry=${math.clamp(expireTimeSec, 0, this.maxExpireSec)}` : "";
		const result = InternalHttpManager.GetAsync(`${AirshipUrl.DataStoreService}/cache/key/${key}${query}`);
		if (!result.success) {
			throw error(`Unable to get cache key. Status Code: ${result.statusCode}.\n${inspect(result.data)}`);
		}

		if (!result.data) return;

		return DecodeJSON(result.data) as T;
	}

	/**
	 * Sets the data for the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param data The data to associate with the provided key.
	 * @param expireTimeSec The duration this key should live after being set in seconds. The maximum duration is 24 hours.
	 * @returns The data that was associated with the provided key.
	 */
	public async SetCacheKey<T extends object>(key: string, data: T, expireTimeSec: number): Promise<T> {
		this.checkKey(key);
		const result = InternalHttpManager.PostAsync(
			`${AirshipUrl.DataStoreService}/cache/key/${key}?expiry=${math.clamp(expireTimeSec, 0, this.maxExpireSec)}`,
			EncodeJSON(data),
		);
		if (!result.success) {
			throw error(`Unable to set cache key. Status Code: ${result.statusCode}.\n${inspect(result.data)}`);
		}

		return DecodeJSON(result.data) as T;
	}

	/**
	 * Deletes the data associated with the provided key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 */
	public async DeleteCacheKey(key: string): Promise<void> {
		this.checkKey(key);

		await this.SetCacheKeyTTL(key, 0);
	}

	/**
	 * Sets a new lifetime for the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param expireTimeSec The duration this key should live in seconds. The maximum duration is 24 hours.
	 * @returns The new lifetime of the key.
	 */
	public async SetCacheKeyTTL(key: string, expireTimeSec: number): Promise<number> {
		this.checkKey(key);

		const result = InternalHttpManager.GetAsync(
			`${AirshipUrl.DataStoreService}/cache/key/${key}/ttl?expiry=${math.clamp(
				expireTimeSec,
				0,
				this.maxExpireSec,
			)}`,
		);
		if (!result.success) {
			throw error(`Unable to set cache key ttl. Status Code: ${result.statusCode}.\n${inspect(result.data)}`);
		}

		return (DecodeJSON(result.data) as { ttl: number }).ttl;
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
