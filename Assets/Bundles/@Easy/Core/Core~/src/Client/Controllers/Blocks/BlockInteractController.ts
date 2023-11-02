import { Controller } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { Entity } from "Shared/Entity/Entity";
import { BreakBlockMeta, TillBlockMeta } from "Shared/Item/ItemMeta";
import { BlockDataAPI, CoreBlockMetaKeys } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { BlockHealthController } from "../BlockInteractions/BlockHealthController";
import { BeforeBlockHitSignal } from "../BlockInteractions/Signal/BeforeBlockHitSignal";
import { LocalEntityController } from "../Character/LocalEntityController";
import { ItemUtil } from "Shared/Item/ItemUtil";

@Controller({})
export class BlockInteractController {
	constructor(
		private readonly blockHealth: BlockHealthController,
		private readonly localEntity: LocalEntityController,
	) {}

	public PerformBlockHit(
		entity: Entity,
		breakBlock: BreakBlockMeta | undefined,
		voxelPos: Vector3,
		showHealthbars: boolean,
	) {
		const world = WorldAPI.GetMainWorld();
		if (!world) return;

		const block = world.GetBlockAt(voxelPos);

		if (showHealthbars) {
			CoreClientSignals.BeforeBlockHit.Fire(new BeforeBlockHitSignal(voxelPos, block, false));
		}

		this.localEntity.AddToMoveData("HitBlock", voxelPos);

		if (entity.player && breakBlock) {
			//Check to see if we can actually do damage here
			const damage = WorldAPI.CalculateBlockHitDamageFromBreakBlockMeta(entity, block, voxelPos, breakBlock);
			if (damage === 0) {
				return;
			}

			//Do the actual damage
			const health = BlockDataAPI.GetBlockData<number>(voxelPos, "health") ?? WorldAPI.DefaultVoxelHealth;
			const newHealth = math.max(health - damage, 0);

			BlockDataAPI.SetBlockData(voxelPos, CoreBlockMetaKeys.CURRENT_HEALTH, newHealth);

			//Local Client visualization
			if (newHealth === 0) {
				// const aboveBlock = world.GetBlockAbove(voxelPos);
				// if (aboveBlock.itemMeta?.block?.requiresFoundation) {

				// }

				//Destroy block
				world.DeleteBlock(voxelPos);
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

	public PerformBlockTill(entity: Entity, tillBlock: TillBlockMeta | undefined, voxelPos: Vector3) {
		const world = WorldAPI.GetMainWorld();
		if (!world) return;

		if (entity.player && tillBlock) {
			const above = world.GetBlockAbove(voxelPos);
			if (above.IsCrop()) {
				return;
			}

			const block = world.GetBlockAt(voxelPos);
			const tillable = block.itemMeta?.block?.tillable;
			if (!tillable) {
				return;
			}

			this.localEntity.AddToMoveData("TillBlock", voxelPos);

			world.PlaceBlockById(voxelPos, tillable.tillsToBlockId, {
				placedByEntityId: entity.id,
			});
		}
	}
}
