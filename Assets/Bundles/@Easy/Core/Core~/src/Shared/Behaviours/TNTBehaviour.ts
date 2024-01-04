import { Dependency } from "@easy-games/flamework-core";
import { BlockInteractService } from "Server/Services/Block/BlockInteractService";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { ItemType } from "Shared/Item/ItemType";
import { RunUtil } from "Shared/Util/RunUtil";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

export default class TntBehaviour extends AirshipBehaviour {
	public renderModelOnServer = false;
	public secondsToDetonate = 3;

	// @NonSerialized() // This is set through code
	public rigidBody!: Rigidbody;

	public Awake(): void {
		if (RunUtil.IsClient() || this.renderModelOnServer) {
			const world = WorldAPI.GetMainWorld();
			if (world) {
				const tntId = world.voxelWorld.blocks.GetBlockIdFromStringId(ItemType.TNT);
				let prefab = MeshProcessor.ProduceSingleBlock(tntId, world.voxelWorld, 0, 0);
				if (prefab) {
					prefab.transform.parent = this.gameObject.transform;
				}
			}
		}

		// TSSSSSST... 💥
		this.rigidBody = this.gameObject.AddComponent<Rigidbody>();
		this.LightFuse();
	}

	public LightFuse() {
		this.rigidBody.AddForce(new Vector3(0, 10, 0), ForceMode.Impulse);
		task.delay(this.secondsToDetonate, () => {
			this.Detonate();
		});
	}

	public Detonate() {
		if (RunUtil.IsServer()) {
			Dependency(BlockInteractService).DamageBlockAOE(undefined, this.gameObject.transform.position, {
				damageRadius: 30,
				blockExplosiveDamage: 30,
				innerDamage: 30,
				outerDamage: 30,
			});
		}
		GameObjectUtil.Destroy(this.gameObject);
	}
}
