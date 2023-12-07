import { AssetCache } from "Shared/AssetCache/AssetCache";
import { AllBundleItems, BundleData, BundleGroupNames, ReferenceManagerAssets } from "./ReferenceManagerResources";

export class BundleReferenceManager {
	public static LoadResources<T>(groupId: BundleGroupNames, bundleIndex = 0): Array<T> {
		let bundleGroup = ReferenceManagerAssets.bundleGroups.get(groupId);
		if (bundleGroup === undefined) {
			return [];
		}
		return this.LoadResourcesFromBundle<T>(bundleGroup.bundles.get(bundleIndex));
	}

	public static GetPathForResource(groupId: BundleGroupNames, bundleIndex: number, itemKey: number): string {
		let bundleGroup = ReferenceManagerAssets.bundleGroups.get(groupId);
		if (bundleGroup === undefined) {
			return "";
		}
		return bundleGroup.bundles.get(bundleIndex)?.filePaths.get(itemKey) ?? "";
	}

	public static LoadResource<T>(groupId: BundleGroupNames, bundleIndex: number, itemKey: number): T | undefined {
		let bundleGroup = ReferenceManagerAssets.bundleGroups.get(groupId);
		if (bundleGroup === undefined) {
			return undefined;
		}
		return this.LoadResourceFromBundle<T>(bundleGroup.bundles.get(bundleIndex), itemKey);
	}

	public static LoadResourcesFromBundle<T>(group: BundleData | undefined): Array<T> {
		return this.LoadResourcesFromMap<T>(group?.filePaths);
	}

	public static LoadResourceFromBundle<T>(group: BundleData | undefined, itemKey: number): T | undefined {
		return this.LoadResourceFromMap<T>(group?.filePaths, itemKey);
	}

	public static LoadResourcesFromMap<T>(filePaths: Map<number, string> | undefined): Array<T> {
		if (!filePaths || filePaths.isEmpty()) {
			error("Trying to load resources from empty map in ReferenceManager.ts");
			return [];
		}
		let loadedResources: Array<T> = new Array<T>();
		filePaths.forEach(function (filePath, index) {
			if (filePath === "") {
				delete loadedResources[index];
			} else {
				loadedResources[index] = AssetCache.LoadAsset<T>(filePath);
			}
		});
		return loadedResources;
	}

	public static LoadResourceFromMap<T>(filePaths: Map<number, string> | undefined, itemKey: number) {
		if (!filePaths) {
			return undefined;
		}
		let path = filePaths.get(itemKey);
		return AssetCache.LoadAsset<T>(path ? path : "");
	}

	public static GetDirectPath(bundleId: AllBundleItems) {
		return bundleId as string;
	}

	public static LoadDirectResource<T>(bundleId: AllBundleItems) {
		const path: string = bundleId as string;
		if (path && path !== "") {
			return AssetCache.LoadAsset<T>(path);
		}
		return undefined;
	}
}
