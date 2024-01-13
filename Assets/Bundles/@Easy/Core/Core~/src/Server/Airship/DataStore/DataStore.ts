import { OnStart, Service } from "@easy-games/flamework-core";
import { Result } from "Shared/Types/Result";
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
	public async GetKey<T extends object>(key: string): Promise<Result<T, undefined>> {
		this.checkKey(key);

		const result = await DataStoreServiceBackend.GetKey(key);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to get data key. Status Code: ${result.statusCode}.\n${result.data}`);
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
			data: DecodeJSON(result.data) as T,
		};
	}

	/**
	 * Sets the data for the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @param data The data to associate with the provided key.
	 * @returns The data that was associated with the provided key.
	 */
	public async SetKey<T extends object>(key: string, data: T): Promise<Result<T, undefined>> {
		this.checkKey(key);

		const result = await DataStoreServiceBackend.SetKey(key, EncodeJSON(data));
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to set data key. Status Code: ${result.statusCode}.\n${result.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(result.data) as T,
		};
	}

	/**
	 * Deletes the data associated with the given key.
	 * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
	 * @returns The data that was deleted. If no data was deleted, nothing will be returned.
	 */
	public async DeleteKey<T extends object>(key: string): Promise<Result<T | undefined, undefined>> {
		this.checkKey(key);

		const result = await DataStoreServiceBackend.DeleteKey(key);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to delete data key. Status Code: ${result.statusCode}.\n${result.data}`);
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
			data: DecodeJSON(result.data) as T,
		};
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
