/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { BundleData, BundleGroup, BundleGroupNames } from "../Util/ReferenceManagerResources";
export declare class EffectsManager {
    static SpawnBundleEffect(bundleGroupId: BundleGroupNames, bundleId: number, effectId: number, worldPosition: Vector3, worldRotation: Vector3, destroyInSeconds?: number): GameObject | undefined;
    static SpawnBundleGroupEffect(bundleGroup: BundleGroup, bundleId: number, effectId: number, worldPosition: Vector3, worldRotation: Vector3, destroyInSeconds?: number): GameObject | undefined;
    static SpawnBundleDataEffect(bundle: BundleData, effectId: number, hitTransform: Transform | undefined, destroyInSeconds?: number): GameObject | undefined;
    static SpawnEffectAtPosition(template: GameObject, worldPosition: Vector3, worldEuler?: Vector3, destroyInSeconds?: number): GameObject;
    static SpawnEffect(template: GameObject, parent?: Transform, destroyInSeconds?: number): GameObject;
}
