import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { DataStoreServiceCache, DataStoreServiceClient } from "@Easy/Core/Shared/TypePackages/data-store-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum CacheStoreServiceBridgeTopics {
	GetKey = "CacheStore:GetKey",
	SetKey = "CacheStore:SetKey",
	SetKeyTTL = "CacheStore:SetKeyTTL",
}

export type ServerBridgeApiCacheGetKey<T> = (
	key: string,
	expireTimeSec?: number,
) => DataStoreServiceCache.CacheRecord<T> | undefined;
export type ServerBridgeApiCacheSetKey<T> = (
	key: string,
	data: T,
	expireTimeSec: number,
) => DataStoreServiceCache.CacheRecord<T> | undefined;
export type ServerBridgeApiCacheSetKeyTTL = (key: string, expireTimeSec: number) => number;

const client = new DataStoreServiceCache.Client(UnityMakeRequest(AirshipUrl.DataStoreService));

@Service({})
export class ProtectedCacheStoreService {
	/** Reflects backend data-store-service settings */
	private maxExpireSec = 60 * 60 * 24; // 24h in seconds

	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiCacheGetKey<unknown>>(
			CacheStoreServiceBridgeTopics.GetKey,
			(_, key, expireTimeSec) => {
				return this.GetKey(key, expireTimeSec).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiCacheSetKey<unknown>>(
			CacheStoreServiceBridgeTopics.SetKey,
			(_, key, data, expireTimeSec) => {
				return this.SetKey(key, data, expireTimeSec).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiCacheSetKeyTTL>(
			CacheStoreServiceBridgeTopics.SetKeyTTL,
			(_, key, expireTimeSec) => {
				return this.SetKeyTTL(key, expireTimeSec).expect();
			},
		);
	}

	public async GetKey<T>(key: string, expireTimeSec?: number): Promise<ReturnType<ServerBridgeApiCacheGetKey<T>>> {
		const expiry = expireTimeSec !== undefined ? math.clamp(expireTimeSec, 0, this.maxExpireSec) : undefined;
		const result = await client.get<T>({ params: { key }, query: { expiry } });
		return result.record;
	}

	public async SetKey<T>(
		key: string,
		data: T,
		expireTimeSec: number,
	): Promise<ReturnType<ServerBridgeApiCacheSetKey<T>>> {
		const expiry = expireTimeSec !== undefined ? math.clamp(expireTimeSec, 0, this.maxExpireSec) : undefined;
		const result = await client.set<T>({
			data: {
				__airship_dto_version__: 1,
				data,
			} satisfies DataStoreServiceCache.SetBodyDto<T>,
			params: {
				key,
			},
			query: {
				expiry,
			},
		});
		return result.record;
	}

	public async SetKeyTTL(key: string, expireTimeSec: number): Promise<ReturnType<ServerBridgeApiCacheSetKeyTTL>> {
		const expiry = math.clamp(expireTimeSec, 0, this.maxExpireSec);
		await client.get({ params: { key }, query: { expiry } }).then((record) => record.record);
		return expiry;
	}

	protected OnStart(): void {}
}
