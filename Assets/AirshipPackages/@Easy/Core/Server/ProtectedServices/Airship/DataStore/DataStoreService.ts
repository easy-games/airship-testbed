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

export type ServerBridgeApiDataGetKey<T> = (key: string) => Result<T | undefined, string>;
export type ServerBridgeApiDataSetKey<T> = (key: string, data: T) => Result<T, string>;
export type ServerBridgeApiDataDeleteKey<T> = (key: string) => Result<T | undefined, string>;

@Service({})
export class ProtectedDataStoreService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiDataGetKey<unknown>>("DataStore:GetKey", (_, key) => {
			const [success, result] = this.GetKey(key).await();
			if (!success) {
				return {
					success: false,
					error: "Unable to complete request.",
				};
			}
			return result;
		});

		contextbridge.callback<ServerBridgeApiDataSetKey<unknown>>("DataStore:SetKey", (_, key, data) => {
			const [success, result] = this.SetKey(key, data).await();
			if (!success) {
				return {
					success: false,
					error: "Unable to complete request.",
				};
			}
			return result;
		});

		contextbridge.callback<ServerBridgeApiDataDeleteKey<unknown>>("DataStore:DeleteKey", (_, key) => {
			const [success, result] = this.DeleteKey(key).await();
			if (!success) {
				return {
					success: false,
					error: "Unable to complete request.",
				};
			}
			return result;
		});
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

	public async SetKey<T>(key: string, data: T): Promise<ReturnType<ServerBridgeApiDataSetKey<T>>> {
		const result = InternalHttpManager.PostAsync(
			`${AirshipUrl.DataStoreService}/data/key/${key}`,
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

	public async DeleteKey<T>(key: string): Promise<ReturnType<ServerBridgeApiDataDeleteKey<T>>> {
		const result = InternalHttpManager.DeleteAsync(`${AirshipUrl.DataStoreService}/data/key/${key}`);
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
