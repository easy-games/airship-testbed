import { Controller } from "@easy-games/flamework-core";
import { Entity } from "Shared/Entity/Entity";
import { BreakBlockMeta } from "Shared/Item/ItemMeta";
import { BlockDataAPI } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { BlockHealthController } from "../BlockInteractions/BlockHealthController";
import { LocalEntityController } from "../Character/LocalEntityController";

@Controller({})
export class BlockInteractController {
	constructor(
		private readonly blockHealth: BlockHealthController,
		private readonly localEntity: LocalEntityController,
	) {}

	public DamageBlock(
		entity: Entity,
		breakBlock: BreakBlockMeta | undefined,
		voxelPos: Vector3,
		showHealthbars: boolean,
	) {
		const world = WorldAPI.GetMainWorld();
		if (!world) return;

		const block = world.GetBlockAt(voxelPos);

		if (showHealthbars) {
			this.blockHealth.OnBeforeBlockHit(voxelPos, block);
		}

		this.localEntity.AddToMoveData("HitBlock", voxelPos);

		if (entity.player && breakBlock) {
			//Check to see if we can actually do damage here
			const damage = WorldAPI.BlockHitDamageFunc(entity.player, block, voxelPos, breakBlock);
			if (damage === 0) {
				return;
			}

			//Do the actual damage
			const health = BlockDataAPI.GetBlockData<number>(voxelPos, "health") ?? WorldAPI.DefaultVoxelHealth;
			const newHealth = math.max(health - damage, 0);

			BlockDataAPI.SetBlockData(voxelPos, "health", newHealth);

			//Local Client visualization
			if (newHealth === 0) {
				//Destroy block
				world.PlaceBlockById(voxelPos, 0);
				if (showHealthbars) {
					this.blockHealth.VisualizeBlockBreak(voxelPos, block.blockId);
				}
			} else {
				//Damage block
				if (showHealthbars) {
					this.blockHealth.VisualizeBlockHealth(voxelPos);
				}
			}
		}
	}
}
