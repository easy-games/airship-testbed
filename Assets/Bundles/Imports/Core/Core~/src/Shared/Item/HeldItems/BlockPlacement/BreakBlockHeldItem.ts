import { Dependency } from "@easy-games/flamework-core";
import { BlockHealthController } from "Client/Controllers/BlockInteractions/BlockHealthController";
import { BlockSelectController } from "Client/Controllers/BlockInteractions/BlockSelectController";
import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
import { Game } from "../../../Game";
import { ProgressBarGraphics } from "../../../UI/ProgressBarGraphics";
import { BlockDataAPI } from "../../../VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "../../../VoxelWorld/WorldAPI";
import { HeldItem } from "../HeldItem";

interface HealthbarEntry {
	gameObject: GameObject;
	progressBar: ProgressBarGraphics;
	maxHealth: number;
}

export class BreakBlockHeldItem extends HeldItem {
	override OnEquip() {
		super.OnEquip();
		if (this.entity.IsLocalCharacter()) {
			Dependency<BlockSelectController>().Enable();
		}
	}

	override OnUnEquip() {
		super.OnUnEquip();
		if (this.entity.IsLocalCharacter()) {
			Dependency<BlockSelectController>().Disable();
		}
	}

	override OnUseClient(useIndex: number) {
		super.OnUseClient(useIndex);
		if (this.entity.IsLocalCharacter()) {
			this.HitBlockLocal();
		}
	}

	private HitBlockLocal(): void {
		const voxelPos = Dependency<BlockSelectController>().SelectedBlockPosition;
		if (!voxelPos) {
			return;
		}

		const world = WorldAPI.GetMainWorld();
		const block = world.GetBlockAt(voxelPos);

		//Pass along event data =
		Dependency<BlockHealthController>().OnBeforeBlockHit(voxelPos, block);
		Dependency<LocalEntityController>().AddToMoveData("HitBlock", voxelPos);

		if (this.entity.player && this.meta.breakBlock) {
			//Check to see if we can actually do damage here
			const damage = WorldAPI.BlockHitDamageFunc(Game.LocalPlayer, block, voxelPos, this.meta.breakBlock);
			if (damage === 0) {
				return;
			}

			//Do the actual damage
			const health = BlockDataAPI.GetBlockData<number>(voxelPos, "health") ?? WorldAPI.DefaultVoxelHealth;
			const blockType = WorldAPI.GetMainWorld().GetBlockAt(voxelPos).itemType;
			const newHealth = math.max(health - damage, 0);
			BlockDataAPI.SetBlockData(voxelPos, "health", newHealth);

			if (newHealth === 0) {
				//Destroy block
				world.PlaceBlockById(voxelPos, 0);

				//Local Client visualization
				Dependency<BlockHealthController>().VisualizeBlockBreak(voxelPos, block.blockId);
			} else {
				//Local Client visualization
				Dependency<BlockHealthController>().VisualizeBlockHealth(voxelPos);
			}
		}

		if (this.meta.breakBlock) {
		}
	}
}
