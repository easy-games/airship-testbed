export class AssetCache {
	private static loadedAssets = new Map<string, unknown>();

	/**
	 * Loads a file from game bundle.
	 *
	 * Example path: "Shared/Resources/Test.prefab"
	 *
	 * Make sure to include a file extension (example: `.prefab` or `.png`)
	 * @returns
	 */
	public static LoadAsset<T = GameObject>(path: string): T {
		if (this.loadedAssets.has(path)) {
			return this.loadedAssets.get(path) as T;
		}
		const asset = AssetBridge.Instance.LoadAsset<T>(path);
		this.loadedAssets.set(path, asset);
		return asset;
	}

	/**
	 * Loads a file from game bundle.
	 *
	 * Example path: "Shared/Resources/Test.prefab"
	 *
	 * Make sure to include a file extension (example: `.prefab` or `.png`)
	 * @returns
	 */
	public static LoadAssetIfExists<T = GameObject>(path: string): T | undefined {
		if (this.loadedAssets.has(path)) {
			return this.loadedAssets.get(path) as T;
		}
		const asset = AssetBridge.Instance.LoadAssetIfExists<T>(path);
		this.loadedAssets.set(path, asset);
		return asset;
	}
}
