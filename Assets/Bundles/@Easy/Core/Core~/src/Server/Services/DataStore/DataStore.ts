import { Service, OnStart } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "Shared/json";

/**
 * The Data Store provides simple key/value persistent storage.
 *
 * The data store provides durable storage that can be accessed from any game server. Data access is slower than
 * the Cache Store, but the data will never expire.
 *
 * The Data Store is good for things like user configuration settings. If you want to keep track of user statistics or
 * inventory, check out the Leaderboard and AirshipInventory systems.
 */
@Service({})
export class DataStore implements OnStart {
	OnStart(): void {}

	/**
	 * Gets the data associated with the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @returns The data associated with the provided key. If no data is found, nothing is returned.
	 */
	public async GetDataKey<T extends object>(key: string): Promise<T | void> {
		this.checkKey(key);

		const result = InternalHttpManager.GetAsync(`${AirshipUrl.DataStoreService}/data/key/${key}`);
		if (!result.success) {
			throw error(`Unable to get data key. Status Code: ${result.statusCode}.\n${inspect(result.data)}`);
		}

		if (!result.data) return undefined;

		return DecodeJSON(result.data) as T;
	}

	/**
	 * Sets the data for the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param data The data to associate with the provided key.
	 * @returns The data that was associated with the provided key.
	 */
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

	/**
	 * Deletes the data associated with the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @returns The data that was deleted. If no data was deleted, nothing will be returned.
	 */
	public async DeleteDataKey<T extends object>(key: string): Promise<T | void> {
		this.checkKey(key);

		const result = InternalHttpManager.DeleteAsync(`${AirshipUrl.DataStoreService}/data/key/${key}`, "");
		if (!result.success) {
			throw error(`Unable to delete data key. Status Code: ${result.statusCode}.\n${inspect(result.data)}`);
		}

		if (!result.data) return;

		return DecodeJSON(result.data) as T;
	}

	/**
	 * Checks that the key is valid
	 */
	private checkKey(key: string): void {
		if (!key || key.match("^[%w%.%:]+$")[0] === undefined) {
			throw error(
				"Bad key provided. Ensure that your data store keys only include alphanumeric characters, _, ., and :",
			);
		}
	}
}
