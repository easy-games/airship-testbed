export declare class AssetCache {
    private static loadedAssets;
    /**
     * Loads a file from game bundle.
     *
     * Example path: "@Easy/Core/Shared/Resources/Test.prefab"
     *
     * Make sure to include a file extension (example: `.prefab` or `.png`)
     * @returns
     */
    static LoadAsset<T = GameObject>(path: string): T;
    /**
     * Loads a file from game bundle.
     *
     * Example path: "@Easy/Core/Shared/Resources/Test.prefab"
     *
     * Make sure to include a file extension (example: `.prefab` or `.png`)
     * @returns
     */
    static LoadAssetIfExists<T = GameObject>(path: string): T | undefined;
}
