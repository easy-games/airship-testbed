import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { DataStoreServiceData, DataStoreServicePrisma } from "@Easy/Core/Shared/TypePackages/data-store-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum DataStoreServiceBridgeTopics {
	GetKey = "DataStore:GetKey",
	SetKey = "DataStore:SetKey",
	DeleteKey = "DataStore:DeleteKey",
	SetLock = "DataStore:SetLock",
	GetLockData = "DataStore:GetLockData",
}

export type ServerBridgeApiDataGetKey<T> = (key: string) => DataStoreServiceData.BlobDataRecord<T> | undefined;
export type ServerBridgeApiDataSetKey<T> = (
	key: string,
	data: T,
	etag?: string,
) => DataStoreServiceData.BlobDataRecord<T>;
export type ServerBridgeApiDataDeleteKey<T> = (
	key: string,
	etag?: string,
) => DataStoreServiceData.BlobDataRecord<T> | undefined;
export type ServerBridgeApiDataSetLock = (
	key: string,
	mode?: DataStoreServicePrisma.BlobLockMode,
	stealFromOwnerId?: string,
) => boolean;
export type ServerBridgeApiDataGetLockData = (key: string) => DataStoreServiceData.IsDataLocked;

const client = new DataStoreServiceData.Client(UnityMakeRequest(AirshipUrl.DataStoreService));

@Service({})
export class ProtectedDataStoreService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiDataGetKey<unknown>>(DataStoreServiceBridgeTopics.GetKey, (_, key) => {
			return this.GetKey(key).expect();
		});

		contextbridge.callback<ServerBridgeApiDataSetKey<unknown>>(
			DataStoreServiceBridgeTopics.SetKey,
			(_, key, data, etag) => {
				return this.SetKey(key, data, etag).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiDataSetLock>(
			DataStoreServiceBridgeTopics.SetLock,
			(_, key, mode, stealId) => {
				return this.SetLockForKey(key, mode, stealId).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiDataGetLockData>(DataStoreServiceBridgeTopics.GetLockData, (_, key) => {
			return this.GetLockDataForKey(key).expect();
		});

		contextbridge.callback<ServerBridgeApiDataDeleteKey<unknown>>(
			DataStoreServiceBridgeTopics.DeleteKey,
			(_, key) => {
				return this.DeleteKey(key).expect();
			},
		);
	}

	public async GetKey<T>(key: string): Promise<ReturnType<ServerBridgeApiDataGetKey<T>>> {
		const result = await client.get<T>({ key });
		return result.record;
	}

	public async SetKey<T>(key: string, data: T, etag?: string): Promise<ReturnType<ServerBridgeApiDataSetKey<T>>> {
		const result = await client.set<T>({ params: { key }, data, query: { etag } });
		return result.record;
	}

	public async DeleteKey<T>(key: string, etag?: string): Promise<ReturnType<ServerBridgeApiDataDeleteKey<T>>> {
		const result = await client.delete<T>({ params: { key }, query: { etag } });
		return result.record;
	}

	public async SetLockForKey(
		key: string,
		lockMode?: DataStoreServicePrisma.BlobLockMode,
		stealFromOwnerId?: string,
	): Promise<ReturnType<ServerBridgeApiDataSetLock>> {
		const result = await client.setLock({
			params: { key },
			data: { forceIfWriterId: stealFromOwnerId, mode: lockMode },
		});
		return result.success;
	}

	public async GetLockDataForKey(key: string): Promise<ReturnType<ServerBridgeApiDataGetLockData>> {
		return await client.getLock({ key });
	}

	protected OnStart(): void {}
}
