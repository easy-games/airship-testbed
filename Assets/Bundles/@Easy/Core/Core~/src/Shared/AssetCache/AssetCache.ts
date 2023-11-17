export class AssetCache {
	private static loadedAssets = new Map<string, unknown>();

	public static LoadAsset<T = GameObject>(path: string): T {
		if (this.loadedAssets.has(path)) {
			return this.loadedAssets.get(path) as T;
		}
		const asset = AssetBridge.Instance.LoadAsset<T>(path);
		this.loadedAssets.set(path, asset);
		return asset;
	}
}
