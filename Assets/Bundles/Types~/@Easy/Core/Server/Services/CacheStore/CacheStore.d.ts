/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
/**
 * The Cache Store provides simple key/value cache storage.
 *
 * The Cache Store provides non-durable storage that can be accessed from any game server. Data access is faster than
 * the Data Store, but the data will expire if it is not accessed frequently enough. Cached keys can live for up to 5 minutes
 * without being accessed.
 *
 * The Cache Store is good for things like queue cooldowns or share codes. If you want your data to be persistent, check
 * out the Data Store.
 */
export declare class CacheStore implements OnStart {
    OnStart(): void;
    /**
     * Gets the cached data for the provided key.
     * @param key Key to use. Keys must be alphanumeric and may include the following symbols: _.:
     * @param expireTimeSec The duration this key should live after being accessed. If not provided, key duration will
     * be unchanged.
     * @returns The data associated with the provided key. If no data is associated with the provided key, then nothing will be returned.
     */
    GetCacheKey<T extends object>(key: string, expireTimeSec?: number): Promise<T | void>;
    /**
     * Sets the data for the given key.
     * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
     * @param data The data to associate with the provided key.
     * @param expireTimeSec The duration this key should live after being set. The maximum duration is 300 seconds.
     * @returns The data that was associated with the provided key.
     */
    SetCacheKey<T extends object>(key: string, data: T, expireTimeSec?: number): Promise<T>;
    /**
     * Deletes the data associated with the provided key.
     * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
     */
    DeleteCacheKey(key: string): Promise<void>;
    /**
     * Sets a new lifetime for the given key.
     * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
     * @param expireTimeSec The duration this key should live. The maximum duration is 300 seconds.
     * @returns The new lifetime of the key.
     */
    SetCacheKeyTTL(key: string, expireTimeSec: number): Promise<number>;
    /**
     * Checks that the key is valid
     */
    private checkKey;
}
