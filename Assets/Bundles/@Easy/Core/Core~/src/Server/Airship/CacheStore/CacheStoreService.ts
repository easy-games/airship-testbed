import { Service, OnStart } from "@easy-games/flamework-core";
import { Platform } from "Shared/Airship";
import { Result } from "Shared/Types/Result";
import { RunUtil } from "Shared/Util/RunUtil";
import { DecodeJSON, EncodeJSON } from "Shared/json";

@Service({})
export class CacheStoreService implements OnStart {
	/** Reflects backend data-store-service settings */
	private maxExpireSec = 60 * 60 * 24; // 24h in seconds

	constructor() {
		if (RunUtil.IsServer()) Platform.server.cacheStore = this;
	}

	OnStart(): void {}

	/**
	 * Gets the cached data for the provided key.
	 * @param key Key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param expireTimeSec The duration this key should live after being accessed in seconds. If not provided, key duration will
	 * be unchanged. The maximum expire time is 24 hours.
	 * @returns The data associated with the provided key. If no data is associated with the provided key, then nothing will be returned.
	 */
	public async GetKey<T extends object>(
		key: string,
		expireTimeSec?: number,
	): Promise<Result<T | undefined, undefined>> {
		this.CheckKey(key);

		const expireTime = expireTimeSec !== undefined ? math.clamp(expireTimeSec, 0, this.maxExpireSec) : undefined;
		const result = CacheStoreServiceBackend.GetKey(key, expireTime);
		if (!result.success) {
			warn(`Unable to get cache key. Status Code: ${result.statusCode}.\n`, result.data);
			return {
				success: false,
				data: undefined,
			};
		}

		if (!result.data) {
			return {
				success: false,
				data: undefined,
			};
		}
		return {
			success: true,
			data: DecodeJSON(result.data) as T,
		};
	}

	/**
	 * Sets the data for the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param data The data to associate with the provided key.
	 * @param expireTimeSec The duration this key should live after being set in seconds. The maximum duration is 24 hours.
	 * @returns The data that was associated with the provided key.
	 */
	public async SetKey<T extends object>(key: string, data: T, expireTimeSec: number): Promise<Result<T, undefined>> {
		this.CheckKey(key);

		const expireTime = math.clamp(expireTimeSec, 0, this.maxExpireSec);
		const result = CacheStoreServiceBackend.SetKey(key, expireTime, EncodeJSON(data));
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to set cache key. Status Code: ${result.statusCode}.\n`, result.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(result.data) as T,
		};
	}

	/**
	 * Deletes the data associated with the provided key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 */
	public async DeleteKey(key: string): Promise<Result<number, undefined>> {
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
	public async SetKeyTTL(key: string, expireTimeSec: number): Promise<Result<number, undefined>> {
		this.CheckKey(key);

		const result = CacheStoreServiceBackend.SetKeyTTL(key, math.clamp(expireTimeSec, 0, this.maxExpireSec));
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to set cache key ttl. Status Code: ${result.statusCode}.\n`, result.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: (DecodeJSON(result.data) as { ttl: number }).ttl,
		};
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
