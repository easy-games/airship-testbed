import { Dependency } from "@easy-games/flamework-core";
import { BlockInteractService } from "Server/Services/Block/BlockInteractService";
import { DamageService } from "Server/Services/Damage/DamageService";
import { DamageType } from "Shared/Damage/DamageType";
import { EffectsManager } from "Shared/Effects/EffectsManager";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { AOEDamageDef } from "Shared/Item/ItemDefinitionTypes";
import { ItemType } from "Shared/Item/ItemType";
import { Tween } from "Shared/Tween/Tween";
import { AllBundleItems } from "Shared/Util/ReferenceManagerResources";
import { RunUtil } from "Shared/Util/RunUtil";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import MeshFlashingBehaviour from "./MeshFlashingBehaviour";

export default class TntBehaviour extends AirshipBehaviour {
	public renderModelOnServer = false;
	public secondsToDetonate = 3;

	private rigidBody!: Rigidbody;

	private blockMeshObject?: GameObject;

	public Awake(): void {
		if (RunUtil.IsClient()) {
			const world = WorldAPI.GetMainWorld();
			if (world) {
				const tntId = world.voxelWorld.blocks.GetBlockIdFromStringId(ItemType.TNT);
				let blockMeshGo = MeshProcessor.ProduceSingleBlock(tntId, world.voxelWorld, 0, 0);
				if (blockMeshGo) {
					blockMeshGo.transform.parent = this.gameObject.transform;
					this.blockMeshObject = blockMeshGo;
				}
			}
		}

		// TSSSSSST... 💥
		this.rigidBody = this.gameObject.GetComponent<Rigidbody>();
		this.LightFuse();
	}

	public LightFuse() {
		this.rigidBody.AddForce(new Vector3(0, 10, 0), ForceMode.Impulse);

		let meshFlash: MeshFlashingBehaviour | undefined;
		if (this.blockMeshObject) {
			meshFlash = this.gameObject.GetComponent<MeshFlashingBehaviour>();
			meshFlash.meshRenderer = this.blockMeshObject.GetComponent<MeshRenderer>();
			meshFlash.FlashStart();
		}

		task.delay(this.secondsToDetonate, () => {
			meshFlash?.FlashStop();
			this.Detonate();
		});
	}

	public Detonate() {
		if (RunUtil.IsServer()) {
			let damageDef: AOEDamageDef = {
				damageRadius: 10,
				blockExplosiveDamage: 10,
				innerDamage: 30,
				outerDamage: 10,
			};

			Dependency<BlockInteractService>().DamageBlockAOE(undefined, this.gameObject.transform.position, damageDef);
			Dependency<DamageService>().InflictAOEDamage(this.gameObject.transform.position, 30, damageDef, {
				damageType: DamageType.FIRE,
			});
		} else {
			EffectsManager.SpawnPrefabEffect(
				AllBundleItems.Projectiles_OnHitVFX_FireballExplosion,
				this.gameObject.transform.position,
				Vector3.zero,
			);
		}

		GameObjectUtil.Destroy(this.gameObject);
	}
}
