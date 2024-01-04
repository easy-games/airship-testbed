/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
/**
 * The Data Store provides simple key/value persistent storage.
 *
 * The data store provides durable storage that can be accessed from any game server. Data access is slower than
 * the Cache Store, but the data will never expire.
 *
 * The Data Store is good for things like user configuration settings. If you want to keep track of user statistics or
 * inventory, check out the Leaderboard and AirshipInventory systems.
 */
export declare class DataStore implements OnStart {
    OnStart(): void;
    /**
     * Gets the data associated with the given key.
     * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
     * @returns The data associated with the provided key. If no data is found, nothing is returned.
     */
    GetDataKey<T extends object>(key: string): Promise<T | void>;
    /**
     * Sets the data for the given key.
     * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
     * @param data The data to associate with the provided key.
     * @returns The data that was associated with the provided key.
     */
    SetDataKey<T extends object>(key: string, data: T): Promise<T>;
    /**
     * Deletes the data associated with the given key.
     * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
     * @returns The data that was deleted. If no data was deleted, nothing will be returned.
     */
    DeleteDataKey<T extends object>(key: string): Promise<T | void>;
    /**
     * Checks that the key is valid
     */
    private checkKey;
}
