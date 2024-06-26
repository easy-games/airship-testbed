import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

export enum DataStoreServiceBridgeTopics {
	GetKey = "DataStore:GetKey",
	SetKey = "DataStore:SetKey",
	DeleteKey = "DataStore:DeleteKey",
}

export type ServerBridgeApiDataGetKey<T> = (key: string) => Result<T | undefined, undefined>;
export type ServerBridgeApiDataSetKey<T> = (key: string, data: T) => Result<T, undefined>;
export type ServerBridgeApiDataDeleteKey<T> = (key: string) => Result<T, undefined>;

@Service({})
export class ProtectedDataStoreService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiDataGetKey<unknown>>("DataStore:GetKey", (_, key) => {
			const result = InternalHttpManager.GetAsync(`${AirshipUrl.DataStoreService}/data/key/${key}`);
			if (!result.success || result.statusCode > 299) {
				warn(`Unable to get data key. Status Code: ${result.statusCode}.\n`, result.data);
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
		});

		contextbridge.callback<ServerBridgeApiDataSetKey<unknown>>("DataStore:SetKey", (_, key, data) => {
			const result = InternalHttpManager.PostAsync(
				`${AirshipUrl.DataStoreService}/data/key/${key}`,
				EncodeJSON(data),
			);
			if (!result.success || result.statusCode > 299) {
				warn(`Unable to set data key. Status Code: ${result.statusCode}.\n`, result.data);
				return {
					success: false,
					data: undefined,
				};
			}

			return {
				success: true,
				data: DecodeJSON(result.data),
			};
		});

		contextbridge.callback<ServerBridgeApiDataDeleteKey<unknown>>("DataStore:DeleteKey", (_, key) => {
			const result = InternalHttpManager.DeleteAsync(`${AirshipUrl.DataStoreService}/data/key/${key}`);
			if (!result.success || result.statusCode > 299) {
				warn(`Unable to delete data key. Status Code: ${result.statusCode}.\n`, result.data);
				return {
					success: false,
					data: undefined,
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
		});
	}

	protected OnStart(): void {}
}
