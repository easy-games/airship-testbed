import {
	AirshipDataStoreLockData,
	AirshipDataStoreLockMode,
} from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipDataStore";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { HttpRetryInstance } from "@Easy/Core/Shared/Http/HttpRetry";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum DataStoreServiceBridgeTopics {
	GetKey = "DataStore:GetKey",
	SetKey = "DataStore:SetKey",
	DeleteKey = "DataStore:DeleteKey",
	SetLock = "DataStore:SetLock",
	GetLockData = "DataStore:GetLockData",
}

export type ServerBridgeApiDataGetKey<T> = (key: string) => DataStoreRecord<T> | undefined;
export type ServerBridgeApiDataSetKey<T> = (key: string, data: T, etag?: string) => DataStoreRecord<T>;
export type ServerBridgeApiDataDeleteKey<T> = (key: string, etag?: string) => DataStoreRecord<T> | undefined;
export type ServerBridgeApiDataSetLock = (
	key: string,
	mode?: AirshipDataStoreLockMode,
	stealFromOwnerId?: string,
) => boolean;
export type ServerBridgeApiDataGetLockData = (key: string) => AirshipDataStoreLockData;

export interface DataStoreRecord<T> {
	value: T;
	metadata: {
		etag: string;
	};
}

@Service({})
export class ProtectedDataStoreService {
	private readonly httpRetry = HttpRetryInstance();

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
		const result = await this.httpRetry(
			() => InternalHttpManager.GetAsync(`${AirshipUrl.DataStoreService}/data/key/${key}`),
			"GetDataKey",
		);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to get data key. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		return json.decode<{ record: DataStoreRecord<T> | undefined }>(result.data).record;
	}

	public async SetKey<T>(key: string, data: T, etag?: string): Promise<ReturnType<ServerBridgeApiDataSetKey<T>>> {
		const query = etag ? `?etag=${etag}` : "";
		const result = await this.httpRetry(
			() => InternalHttpManager.PostAsync(
				`${AirshipUrl.DataStoreService}/data/key/${key}${query}`,
				json.encode(data),
			),
			"SetDataKey",
		);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to set data key. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		return json.decode<{ record: DataStoreRecord<T> }>(result.data).record;
	}

	public async DeleteKey<T>(key: string, etag?: string): Promise<ReturnType<ServerBridgeApiDataDeleteKey<T>>> {
		const query = etag ? `?etag=${etag}` : "";
		const result = await this.httpRetry(
			() => InternalHttpManager.DeleteAsync(`${AirshipUrl.DataStoreService}/data/key/${key}${query}`),
			"DeleteDataKey",
		);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to delete data key. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		return json.decode<{ record: DataStoreRecord<T> | undefined }>(result.data).record;
	}

	public async SetLockForKey(
		key: string,
		lockMode?: AirshipDataStoreLockMode,
		stealFromOwnerId?: string,
	): Promise<ReturnType<ServerBridgeApiDataSetLock>> {
		const result = InternalHttpManager.PostAsync(
			`${AirshipUrl.DataStoreService}/data/key/${key}/lock`,
			json.encode({
				lockMode,
				forceIfWriterId: stealFromOwnerId,
			}),
		);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to lock data key. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		return json.decode<{ success: boolean }>(result.data).success;
	}

	public async GetLockDataForKey(key: string): Promise<ReturnType<ServerBridgeApiDataGetLockData>> {
		const result = InternalHttpManager.GetAsync(`${AirshipUrl.DataStoreService}/data/key/${key}/lock`);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to get lock data for key. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		return json.decode<AirshipDataStoreLockData>(result.data);
	}

	protected OnStart(): void {}
}
