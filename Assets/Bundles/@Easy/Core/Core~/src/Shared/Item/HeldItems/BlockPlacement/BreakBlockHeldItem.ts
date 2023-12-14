import { Dependency } from "@easy-games/flamework-core";
import { BlockInteractController } from "Client/Controllers/Blocks/BlockInteractController";
import { BlockDataAPI, CoreBlockMetaKeys } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { BlockSelectHeldItem } from "./BlockSelectHeldItem";

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
			task.delay(0.13, () => {
				this.HitBlockLocal();
			});
		}
	}

	private HitBlockLocal(): void {
		const voxelPos = this.blockSelect?.SelectedBlockPosition;
		if (!voxelPos || !this.CanUseBlock(voxelPos, undefined, undefined)) {
			return;
		}
		this.entity.animator.SetPlaybackSpeed(0.05);
		task.delay(0.03, () => {
			this.entity.animator.SetPlaybackSpeed(1);
		});

		Dependency<BlockInteractController>().PerformBlockHit(this.entity, this.itemMeta?.breakBlock, voxelPos, true);
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
