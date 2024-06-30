import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

export const enum CacheStoreServiceBridgeTopics {
	GetKey = "CacheStore:GetKey",
	SetKey = "CacheStore:SetKey",
	SetKeyTTL = "CacheStore:SetKeyTTL",
}

export type ServerBridgeApiCacheGetKey<T> = (key: string, expireTimeSec?: number) => Result<T | undefined, undefined>;
export type ServerBridgeApiCacheSetKey<T> = (key: string, data: T, expireTimeSec: number) => Result<T, undefined>;
export type ServerBridgeApiCacheSetKeyTTL = (key: string, expireTimeSec: number) => Result<number, undefined>;

@Service({})
export class ProtectedCacheStoreService {
	/** Reflects backend data-store-service settings */
	private maxExpireSec = 60 * 60 * 24; // 24h in seconds

	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiCacheGetKey<unknown>>(
			CacheStoreServiceBridgeTopics.GetKey,
			(_, key, expireTimeSec) => {
				const expireTime =
					expireTimeSec !== undefined ? math.clamp(expireTimeSec, 0, this.maxExpireSec) : undefined;
				const query = expireTime !== undefined ? `?expiry=${expireTime}` : "";
				const result = InternalHttpManager.GetAsync(`${AirshipUrl.DataStoreService}/cache/key/${key}${query}`);
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
					data: DecodeJSON(result.data),
				};
			},
		);

		contextbridge.callback<ServerBridgeApiCacheSetKey<unknown>>(
			CacheStoreServiceBridgeTopics.SetKey,
			(_, key, data, expireTimeSec) => {
				const expireTime = math.clamp(expireTimeSec, 0, this.maxExpireSec);
				const result = InternalHttpManager.PostAsync(
					`${AirshipUrl.DataStoreService}/cache/key/${key}?expiry=${expireTime}`,
					EncodeJSON(data),
				);
				if (!result.success || result.statusCode > 299) {
					warn(`Unable to set cache key. Status Code: ${result.statusCode}.\n`, result.data);
					return {
						success: false,
						data: undefined,
					};
				}

				return {
					success: true,
					data: DecodeJSON(result.data),
				};
			},
		);

		contextbridge.callback<ServerBridgeApiCacheSetKeyTTL>(
			CacheStoreServiceBridgeTopics.SetKeyTTL,
			(_, key, expireTimeSec) => {
				const result = InternalHttpManager.GetAsync(
					`${AirshipUrl.DataStoreService}/cache/key/${key}/ttl?expiry=${math.clamp(
						expireTimeSec,
						0,
						this.maxExpireSec,
					)}`,
				);
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
			},
		);
	}

	protected OnStart(): void {}
}
