/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
export declare class DataStore implements OnStart {
    OnStart(): void;
    GetCacheKey<T extends object>(key: string, expireTimeSec?: number): Promise<T | void>;
    SetCacheKey<T extends object>(key: string, data: T, expireTimeSec?: number): Promise<T>;
    DeleteCacheKey(key: string): Promise<void>;
    SetCacheKeyTTL(key: string, expireTimeSec: number): Promise<number>;
    GetDataKey<T extends object>(key: string): Promise<T | void>;
    SetDataKey<T extends object>(key: string, data: T): Promise<T>;
    DeleteDataKey<T extends object>(key: string): Promise<T | void>;
    private checkKey;
}
