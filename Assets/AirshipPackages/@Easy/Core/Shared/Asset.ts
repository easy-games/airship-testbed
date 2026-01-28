export class Asset {
	private static loadedAssets = new Map<string, unknown>();

	/**
	 * Loads a file from game bundle.
	 *
	 * Example path: "AirshipPackages/@Easy/Core/Test.prefab"
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
	 * Example path: "AirshipPackages/@Easy/Core/Test.prefab"
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

	/**
	 * Loads all resources within a directory path in a game bundle.
	 * 
	 * If `deep` is set to `true`, then all subdirectories will be included as well. The default is `false.`
	 */
	public static LoadAll(directory: string, deep = false) {
		const assetPaths = AssetBridge.Instance.GetAssetPathsInDirectory(directory, deep);
		const assets: Object[] = [];

		for (const path of assetPaths) {
			if (this.loadedAssets.has(path)) {
				assets.push(this.loadedAssets.get(path)!);
			} else {
				const asset = this.LoadAssetIfExists<Object>(path);
				if (asset !== undefined) {
					assets.push(asset);
				}
			}
		}

		return assets;
	}
}
