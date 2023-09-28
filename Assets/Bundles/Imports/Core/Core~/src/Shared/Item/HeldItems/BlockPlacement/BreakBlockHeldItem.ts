import { Dependency } from "@easy-games/flamework-core";
import { BlockSelectController } from "Client/Controllers/BlockInteractions/BlockSelectController";
import { BlockInteractController } from "Client/Controllers/Blocks/BlockInteractController";
import { Game } from "Shared/Game";
import { Bin } from "Shared/Util/Bin";
import { SetInterval } from "Shared/Util/Timer";
import { HeldItemState } from "../HeldItemState";
import { BlockSelectHeldItem } from "./BlockSelectHeldItem";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { BlockDataAPI, CoreBlockMetaKeys } from "Shared/VoxelWorld/BlockData/BlockDataAPI";

export class BreakBlockHeldItem extends BlockSelectHeldItem {
	private holdingDownBin = new Bin();
	private holdingDown = false;

	override OnEquip(): void {
		super.OnEquip();
		if (this.blockSelect) {
			this.blockSelect.highlightOnPlacement = false;
		}
	}
	override OnUnEquip() {
		super.OnUnEquip();
		this.holdingDownBin.Clean();
	}

	override OnUseClient(useIndex: number) {
		super.OnUseClient(useIndex);
		if (this.entity.IsLocalCharacter()) {
			this.HitBlockLocal();

			if (this.meta.itemMechanics?.cooldownSeconds && !this.holdingDown) {
				this.holdingDown = true;
				this.holdingDownBin.Add(
					SetInterval(this.meta.itemMechanics.cooldownSeconds, () => {
						import("Shared/Item/HeldItems/EntityItemManager").then((imp) => {
							if (!Game.LocalPlayer.Character) return;
							const manager = imp.EntityItemManager.Get().GetOrCreateItemManager(
								Game.LocalPlayer.Character,
							);
							manager.TriggerNewState(HeldItemState.CALL_TO_ACTION_END);
							manager.TriggerNewState(HeldItemState.CALL_TO_ACTION_START);
						});
					}),
				);
				this.holdingDownBin.Add(() => {
					this.holdingDown = false;
				});
			}
		}
	}

	override OnCallToActionEnd(): void {
		super.OnCallToActionEnd();
		this.holdingDownBin.Clean();
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
