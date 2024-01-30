/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { Result } from "../../../Shared/Types/Result";
export declare class DataStoreService implements OnStart {
    constructor();
    OnStart(): void;
    /**
     * Gets the data associated with the given key.
     * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
     * @returns The data associated with the provided key. If no data is found, nothing is returned.
     */
    GetKey<T extends object>(key: string): Promise<Result<T | undefined, undefined>>;
    /**
     * Sets the data for the given key.
     * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
     * @param data The data to associate with the provided key.
     * @returns The data that was associated with the provided key.
     */
    SetKey<T extends object>(key: string, data: T): Promise<Result<T, undefined>>;
    /**
     * Deletes the data associated with the given key.
     * @param key The key to use. Keys must be alphanumeric and may include the following symbols: _.:
     * @returns The data that was deleted. If no data was deleted, nothing will be returned.
     */
    DeleteKey<T extends object>(key: string): Promise<Result<T | undefined, undefined>>;
    /**
     * Checks that the key is valid
     */
    private checkKey;
}
