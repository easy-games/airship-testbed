/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { Result } from "../../../Shared/Types/Result";
/**
 * The Cache Store provides simple key/value cache storage.
 *
 * The Cache Store provides non-durable storage that can be accessed from any game server. Data access is faster than
 * the Data Store, but the data will expire if it is not accessed frequently enough. Cached keys can live for up to 24 hours
 * without being accessed.
 *
 * The Cache Store is good for things like queue cooldowns or share codes. If you want your data to be persistent, check
 * out the Data Store.
 */
export declare class CacheStoreService implements OnStart {
    /** Reflects backend data-store-service settings */
    private maxExpireSec;
    OnStart(): void;
    /**
     * Gets the cached data for the provided key.
     * @param key Key to use. Keys must be alphanumeric and may include the following symbols: _.:
     * @param expireTimeSec The duration this key should live after being accessed in seconds. If not provided, key duration will
     * be unchanged. The maximum expire time is 24 hours.
     * @returns The data associated with the provided key. If no data is associated with the provided key, then nothing will be returned.
     */
    GetKey<T extends object>(key: string, expireTimeSec?: number): Promise<Result<T | undefined, undefined>>;
    /**
     * Sets the data for the given key.
     * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
     * @param data The data to associate with the provided key.
     * @param expireTimeSec The duration this key should live after being set in seconds. The maximum duration is 24 hours.
     * @returns The data that was associated with the provided key.
     */
    SetKey<T extends object>(key: string, data: T, expireTimeSec: number): Promise<Result<T, undefined>>;
    /**
     * Deletes the data associated with the provided key.
     * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
     */
    DeleteKey(key: string): Promise<Result<number, undefined>>;
    /**
     * Sets a new lifetime for the given key.
     * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
     * @param expireTimeSec The duration this key should live in seconds. The maximum duration is 24 hours.
     * @returns The new lifetime of the key.
     */
    SetKeyTTL(key: string, expireTimeSec: number): Promise<Result<number, undefined>>;
    /**
     * Checks that the key is valid. Throws an error if not valid.
     */
    private CheckKey;
}
