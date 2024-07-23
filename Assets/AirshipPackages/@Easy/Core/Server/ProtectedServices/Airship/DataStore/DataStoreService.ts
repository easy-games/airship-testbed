import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

export const enum DataStoreServiceBridgeTopics {
	GetKey = "DataStore:GetKey",
	SetKey = "DataStore:SetKey",
	DeleteKey = "DataStore:DeleteKey",
}

export type ServerBridgeApiDataGetKey<T> = (key: string) => Result<DataStoreRecord<T> | undefined, string>;
export type ServerBridgeApiDataSetKey<T> = (key: string, data: T, etag?: string) => Result<DataStoreRecord<T>, string>;
export type ServerBridgeApiDataDeleteKey<T> = (
	key: string,
	etag?: string,
) => Result<DataStoreRecord<T> | undefined, string>;

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
			const [success, result] = this.GetKey(key).await();
			if (!success) {
				return {
					success: false,
					error: "Unable to complete request.",
				};
			}
			return result;
		});

		contextbridge.callback<ServerBridgeApiDataSetKey<unknown>>(
			DataStoreServiceBridgeTopics.SetKey,
			(_, key, data, etag) => {
				const [success, result] = this.SetKey(key, data, etag).await();
				if (!success) {
					return {
						success: false,
						error: "Unable to complete request.",
					};
				}
				return result;
			},
		);

		contextbridge.callback<ServerBridgeApiDataDeleteKey<unknown>>(
			DataStoreServiceBridgeTopics.DeleteKey,
			(_, key) => {
				const [success, result] = this.DeleteKey(key).await();
				if (!success) {
					return {
						success: false,
						error: "Unable to complete request.",
					};
				}
				return result;
			},
		);
	}

	public async GetKey<T>(key: string): Promise<ReturnType<ServerBridgeApiDataGetKey<T>>> {
		const result = InternalHttpManager.GetAsync(`${AirshipUrl.DataStoreService}/data/key/${key}`);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to get data key. Status Code: ${result.statusCode}.\n`, result.error);
			return {
				success: false,
				error: result.error,
			};
		}

		if (!result.data) {
			return {
				success: false,
				error: result.error,
			};
		}

		return {
			success: true,
			data: DecodeJSON(result.data),
		};
	}

	public async SetKey<T>(key: string, data: T, etag?: string): Promise<ReturnType<ServerBridgeApiDataSetKey<T>>> {
		const query = etag ? `?etag=${etag}` : "";
		const result = InternalHttpManager.PostAsync(
			`${AirshipUrl.DataStoreService}/data/key/${key}${query}`,
			EncodeJSON(data),
		);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to set data key. Status Code: ${result.statusCode}.\n`, result.error);
			return {
				success: false,
				error: result.error,
			};
		}

		return {
			success: true,
			data: DecodeJSON(result.data),
		};
	}

	public async DeleteKey<T>(key: string, etag?: string): Promise<ReturnType<ServerBridgeApiDataDeleteKey<T>>> {
		const query = etag ? `?etag=${etag}` : "";
		const result = InternalHttpManager.DeleteAsync(`${AirshipUrl.DataStoreService}/data/key/${key}${query}`);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to delete data key. Status Code: ${result.statusCode}.\n`, result.error);
			return {
				success: false,
				error: result.error,
			};
		}

		if (!result.data) {
			return {
				success: true,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(result.data),
		};
	}

	protected OnStart(): void {}
}
