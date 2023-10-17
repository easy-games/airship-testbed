import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { BundleReferenceManager } from "../Util/BundleReferenceManager";
import {
	AllBundleItems,
	BundleData,
	BundleGroup,
	BundleGroupNames,
	ReferenceManagerAssets,
} from "../Util/ReferenceManagerResources";
import { Task } from "Shared/Util/Task";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";

export class EffectsManager {
	public static SpawnEffect(
		bundleId: AllBundleItems,
		worldPosition: Vector3,
		worldRotation: Vector3,
		destroyInSeconds = 5,
	) {
		let template = BundleReferenceManager.LoadDirectResource<GameObject>(bundleId);
		if (template) {
			return this.SpawnGameObjectAtPosition(template, worldPosition, worldRotation, destroyInSeconds);
		}
		return undefined;
	}

	public static SpawnBundleEffect(
		bundleGroupId: BundleGroupNames,
		bundleId: number,
		effectId: number,
		worldPosition: Vector3,
		worldRotation: Vector3,
		destroyInSeconds = 5,
	) {
		let bundleGroup = ReferenceManagerAssets.bundleGroups.get(bundleGroupId);
		if (bundleGroup) {
			return this.SpawnBundleGroupEffect(
				bundleGroup,
				bundleId,
				effectId,
				worldPosition,
				worldRotation,
				destroyInSeconds,
			);
		}
		return undefined;
	}

	public static SpawnBundleGroupEffect(
		bundleGroup: BundleGroup,
		bundleId: number,
		effectId: number,
		worldPosition: Vector3,
		worldRotation: Vector3,
		destroyInSeconds = 5,
	) {
		let bundle = bundleGroup.bundles.get(bundleId);
		if (!bundle) {
			return undefined;
		}
		let effect = this.SpawnBundleDataEffect(bundle, effectId, undefined, destroyInSeconds);
		if (effect) {
			effect.transform.position = worldPosition;
			effect.transform.eulerAngles = worldRotation;
		}

		return effect;
	}

	public static SpawnBundleDataEffect(
		bundle: BundleData,
		effectId: number,
		hitTransform: Transform | undefined,
		destroyInSeconds = 5,
	): GameObject | undefined {
		if (!bundle || effectId < 0) {
			error("Trying to spawn effect that doesnt exist: " + bundle + ", " + effectId);
			return;
		}
		let template = BundleReferenceManager.LoadResourceFromBundle<GameObject>(bundle, effectId);
		if (template === undefined) {
			error("Trying to spawn effect but prefab template wasn't found: " + bundle.id + ", " + effectId);
			return undefined;
		}
		return this.SpawnGameObject(template, hitTransform, destroyInSeconds);
	}

	public static SpawnGameObjectAtPosition(
		template: GameObject,
		worldPosition: Vector3,
		worldEuler?: Vector3,
		destroyInSeconds = 5,
	) {
		let effect = this.SpawnGameObject(template, undefined, destroyInSeconds);
		effect.transform.position = worldPosition;
		if (worldEuler) {
			effect.transform.eulerAngles = worldEuler;
		}
		return effect;
	}

	public static SpawnGameObject(template: GameObject, parent?: Transform, destroyInSeconds = 5) {
		let vfx: GameObject;
		vfx = PoolManager.SpawnObject(template);
		if (parent) {
			vfx.transform.SetParent(parent);
		}
		vfx.transform.localPosition = Vector3.zero;
		vfx.transform.localEulerAngles = Vector3.zero;
		//vfx.transform.localScale = Vector3.one;

		if (destroyInSeconds > 0) {
			Task.Delay(destroyInSeconds, () => {
				PoolManager.ReleaseObject(vfx);
			});
		}
		return vfx;
	}

	public static ReleaseGameObject(go: GameObject) {
		PoolManager.ReleaseObject(go);
	}

	public static SetParticleToBlockMaterial(particles: ParticleSystemRenderer, blockId: number) {
		const world = WorldAPI.GetMainWorld();
		if (!world) return;
		const blockGO = MeshProcessor.ProduceSingleBlock(blockId, world.voxelWorld);
		if (blockGO) {
			const blockRen = blockGO.GetComponent<Renderer>();
			const blockFilter = blockGO.GetComponent<MeshFilter>();
			particles.mesh = blockFilter.mesh;
			particles.sharedMaterial = blockRen.sharedMaterial;
			GameObjectUtil.Destroy(blockGO);
		}
	}
}
