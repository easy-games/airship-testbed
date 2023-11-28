export declare class AssetCache {
    private static loadedAssets;
    static LoadAsset<T = GameObject>(path: string): T;
    static LoadAssetIfExists<T = GameObject>(path: string): T | undefined;
}
