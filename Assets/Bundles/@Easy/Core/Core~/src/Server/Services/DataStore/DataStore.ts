import { Service, OnStart } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "Shared/json";

@Service({})
export class DataStore implements OnStart {
	OnStart(): void {}

	public async GetCacheKey<T extends object>(key: string, expireTimeSec?: number): Promise<T | void> {
		this.checkKey(key);

		const query: string = expireTimeSec !== undefined ? `?expiry=${expireTimeSec}` : "";
		const result = InternalHttpManager.GetAsync(`${AirshipUrl.DataStoreService}/cache/key/${key}${query}`);
		if (!result.success) {
			throw error(`Unable to get cache key. Status Code: ${result.statusCode}.\n${inspect(result.data)}`);
		}

		return DecodeJSON(result.data) as T;
	}

	public async SetCacheKey<T extends object>(key: string, data: T, expireTimeSec?: number): Promise<T> {
		this.checkKey(key);

		const query: string = expireTimeSec !== undefined ? `?expiry=${expireTimeSec}` : "";
		const result = InternalHttpManager.PostAsync(
			`${AirshipUrl.DataStoreService}/cache/key/${key}${query}`,
			EncodeJSON(data),
		);
		if (!result.success) {
			throw error(`Unable to set cache key. Status Code: ${result.statusCode}.\n${inspect(result.data)}`);
		}

		return DecodeJSON(result.data) as T;
	}

	public async DeleteCacheKey(key: string): Promise<void> {
		this.checkKey(key);

		await this.SetCacheKeyTTL(key, 0);
	}

	public async SetCacheKeyTTL(key: string, expireTimeSec: number): Promise<number> {
		this.checkKey(key);

		const result = InternalHttpManager.GetAsync(
			`${AirshipUrl.DataStoreService}/cache/key/${key}/ttl?expiry=${expireTimeSec}`,
		);
		if (!result.success) {
			throw error(`Unable to set cache key ttl. Status Code: ${result.statusCode}.\n${inspect(result.data)}`);
		}

		return (DecodeJSON(result.data) as { ttl: number }).ttl;
	}

	public async GetDataKey<T extends object>(key: string): Promise<T | void> {
		this.checkKey(key);

		const result = InternalHttpManager.GetAsync(`${AirshipUrl.DataStoreService}/data/key/${key}`);
		if (!result.success) {
			throw error(`Unable to get data key. Status Code: ${result.statusCode}.\n${inspect(result.data)}`);
		}

		if (!result.data) return undefined;

		return DecodeJSON(result.data) as T;
	}

	public async SetDataKey<T extends object>(key: string, data: T): Promise<T> {
		this.checkKey(key);

		const result = InternalHttpManager.PostAsync(
			`${AirshipUrl.DataStoreService}/data/key/${key}`,
			EncodeJSON(data),
		);
		if (!result.success) {
			throw error(`Unable to set data key. Status Code: ${result.statusCode}.\n${inspect(result.data)}`);
		}

		return DecodeJSON(result.data) as T;
	}

	public async DeleteDataKey<T extends object>(key: string): Promise<T | void> {
		this.checkKey(key);

		const result = InternalHttpManager.DeleteAsync(`${AirshipUrl.DataStoreService}/data/key/${key}`, "");
		if (!result.success) {
			throw error(`Unable to delete data key. Status Code: ${result.statusCode}.\n${inspect(result.data)}`);
		}

		if (!result.data) return;

		return DecodeJSON(result.data) as T;
	}

	private checkKey(key: string): void {
		if (!key || key.match("^[%w%.%:]+$")[0] === undefined) {
			throw error(
				"Bad key provided. Ensure that your data store keys only include alphanumeric characters, _, ., and :",
			);
		}
	}
}
