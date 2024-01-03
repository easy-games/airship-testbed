import { Service, OnStart } from "@easy-games/flamework-core";
import { AirshipUrl } from "Shared/Util/AirshipUrl";

@Service({})
export class DataStore implements OnStart {
	OnStart(): void {}

	public async GetCacheKey<T extends object>(key: string, expireTimeSec?: number): Promise<T> {
		InternalHttpManager.GetAsync(`${AirshipUrl.DataStoreService}/cache/key/${key}`);
		return {} as T;
	}

	public async SetCacheKey<T extends object>(key: string, data: T, expireTimeSec?: number): Promise<T> {
		return {} as T;
	}

	public async DeleteCacheKey(key: string): Promise<void> {
		await this.SetCacheKeyTTL(key, 0);
	}

	public async SetCacheKeyTTL(key: string, expireTimeSec: number): Promise<number> {
		return 0;
	}

	public async GetDataKey<T extends object>(key: string): Promise<T> {
		return {} as T;
	}

	public async SetDataKey<T extends object>(key: string, data: T): Promise<T> {
		return {} as T;
	}

	public async DeleteDataKey<T extends object>(key: string): Promise<T> {
		return {} as T;
	}
}
