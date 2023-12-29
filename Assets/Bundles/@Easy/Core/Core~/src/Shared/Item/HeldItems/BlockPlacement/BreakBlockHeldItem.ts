import { Dependency } from "@easy-games/flamework-core";
import { BlockInteractController } from "Client/Controllers/Blocks/BlockInteractController";
import { Entity } from "Shared/Entity/Entity";
import { Cancellable } from "Shared/Util/Cancellable";
import { Signal } from "Shared/Util/Signal";
import { Block } from "Shared/VoxelWorld/Block";
import { BlockDataAPI, CoreBlockMetaKeys } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { BlockSelectHeldItem } from "./BlockSelectHeldItem";

class CanUseBlockSignal extends Cancellable {
	constructor(public readonly block: Block, public readonly blockPos: Vector3, public readonly entity: Entity) {
		super();
	}
}

export class BreakBlockHeldItem extends BlockSelectHeldItem {
	public static canUseBlockSignal = new Signal<CanUseBlockSignal>();

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

		const block = WorldAPI.GetMainWorld()?.GetBlockAt(selectedPos);
		if (!block) {
			return false;
		}
		if (block.IsAir()) {
			return false;
		}
		const noBreak = BlockDataAPI.GetBlockData(selectedPos, CoreBlockMetaKeys.NO_BREAK);
		if (noBreak) {
			return false;
		}

		const useSignal = new CanUseBlockSignal(block, selectedPos, this.entity);
		BreakBlockHeldItem.canUseBlockSignal.Fire(useSignal);
		if (useSignal.IsCancelled()) {
			return false;
		}

		return true;
	}
}
