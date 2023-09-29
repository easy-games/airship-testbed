import { Dependency } from "@easy-games/flamework-core";
import { BlockInteractController } from "Client/Controllers/Blocks/BlockInteractController";
import { Bin } from "Shared/Util/Bin";
import { BlockSelectHeldItem } from "./BlockSelectHeldItem";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { BlockDataAPI, CoreBlockMetaKeys } from "Shared/VoxelWorld/BlockData/BlockDataAPI";

export class BreakBlockHeldItem extends BlockSelectHeldItem {
	override OnEquip(): void {
		super.OnEquip();
		if (this.blockSelect) {
			this.blockSelect.highlightOnPlacement = false;
		}
	}

	override OnUseClient(useIndex: number) {
		super.OnUseClient(useIndex);
		if (this.entity.IsLocalCharacter()) {
			this.HitBlockLocal();
		}
	}

	private HitBlockLocal(): void {
		const voxelPos = this.blockSelect?.SelectedBlockPosition;
		if (!voxelPos || !this.CanUseBlock(voxelPos, undefined, undefined)) {
			return;
		}
		Dependency<BlockInteractController>().PerformBlockHit(this.entity, this.meta.breakBlock, voxelPos, true);
	}

	override CanUseBlock(
		selectedPos: Vector3 | undefined,
		placedPos: Vector3 | undefined,
		highlightedPos: Vector3 | undefined,
	): boolean {
		super.CanUseBlock(selectedPos, placedPos, highlightedPos);
		if (!selectedPos) {
			return false;
		}

		//print("Break Block Can Use");
		const block = WorldAPI.GetMainWorld()?.GetBlockAt(selectedPos);
		if (!block) {
			//print("FALSE no block");
			return false;
		}
		if (block.IsAir()) {
			//print("FALSE is air");
			return false;
		}
		const canBreak = BlockDataAPI.GetBlockData(selectedPos, CoreBlockMetaKeys.CAN_BREAK);
		if (!canBreak) {
			//print("FALSE cant break");
			return false;
		}
		//print("TRUE");
		return true;
	}
}
