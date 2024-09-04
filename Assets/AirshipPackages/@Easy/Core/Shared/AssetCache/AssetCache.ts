import { Asset } from "../Asset";

/**
 * @deprecated Use {@link Asset} instead.
 */
export class AssetCache {
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
		warn('AssetCache is deprecated. Use "Asset" instead. AssetCache will be deleted soon.');
		return Asset.LoadAsset<T>(path);
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
		warn('AssetCache is deprecated. Use "Asset" instead. AssetCache will be deleted soon.');
		return Asset.LoadAssetIfExists<T>(path);
	}
}
