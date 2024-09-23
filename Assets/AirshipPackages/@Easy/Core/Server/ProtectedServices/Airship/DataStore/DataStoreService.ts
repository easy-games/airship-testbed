import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

export const enum DataStoreServiceBridgeTopics {
	GetKey = "DataStore:GetKey",
	SetKey = "DataStore:SetKey",
	DeleteKey = "DataStore:DeleteKey",
}

export type ServerBridgeApiDataGetKey<T> = (key: string) => DataStoreRecord<T> | undefined;
export type ServerBridgeApiDataSetKey<T> = (key: string, data: T, etag?: string) => DataStoreRecord<T>;
export type ServerBridgeApiDataDeleteKey<T> = (key: string, etag?: string) => DataStoreRecord<T> | undefined;

export interface DataStoreRecord<T> {
	value: T;
	metadata: {
		etag: string;
	};
}

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

		contextbridge.callback<ServerBridgeApiDataDeleteKey<unknown>>(
			DataStoreServiceBridgeTopics.DeleteKey,
			(_, key) => {
				return this.DeleteKey(key).expect();
			},
		);
	}

	public async GetKey<T>(key: string): Promise<ReturnType<ServerBridgeApiDataGetKey<T>>> {
		const result = InternalHttpManager.GetAsync(`${AirshipUrl.DataStoreService}/data/key/${key}`);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to get data key. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		if (!result.data) {
			return undefined;
		}

		return DecodeJSON(result.data) as DataStoreRecord<T>;
	}

	public async SetKey<T>(key: string, data: T, etag?: string): Promise<ReturnType<ServerBridgeApiDataSetKey<T>>> {
		const query = etag ? `?etag=${etag}` : "";
		const result = InternalHttpManager.PostAsync(
			`${AirshipUrl.DataStoreService}/data/key/${key}${query}`,
			EncodeJSON(data),
		);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to set data key. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		return DecodeJSON(result.data) as DataStoreRecord<T>;
	}

	public async DeleteKey<T>(key: string, etag?: string): Promise<ReturnType<ServerBridgeApiDataDeleteKey<T>>> {
		const query = etag ? `?etag=${etag}` : "";
		const result = InternalHttpManager.DeleteAsync(`${AirshipUrl.DataStoreService}/data/key/${key}${query}`);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to delete data key. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		if (!result.data) {
			return undefined;
		}

		return DecodeJSON(result.data) as DataStoreRecord<T>;
	}

	protected OnStart(): void {}
}
