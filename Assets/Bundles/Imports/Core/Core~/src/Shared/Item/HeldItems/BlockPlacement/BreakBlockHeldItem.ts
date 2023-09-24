import { Dependency } from "@easy-games/flamework-core";
import { BlockSelectController } from "Client/Controllers/BlockInteractions/BlockSelectController";
import { BlockInteractController } from "Client/Controllers/Blocks/BlockInteractController";
import { Game } from "Shared/Game";
import { Bin } from "Shared/Util/Bin";
import { SetInterval } from "Shared/Util/Timer";
import { ProgressBarGraphics } from "../../../UI/ProgressBarGraphics";
import { HeldItem } from "../HeldItem";
import { HeldItemState } from "../HeldItemState";

interface HealthbarEntry {
	gameObject: GameObject;
	progressBar: ProgressBarGraphics;
	maxHealth: number;
}

export class BreakBlockHeldItem extends HeldItem {
	private holdingDownBin = new Bin();
	private holdingDown = false;

	override OnEquip() {
		super.OnEquip();
		if (this.entity.IsLocalCharacter()) {
			Dependency<BlockSelectController>().Enable();
		}
	}

	override OnUnEquip() {
		super.OnUnEquip();
		this.holdingDownBin.Clean();
		if (this.entity.IsLocalCharacter()) {
			Dependency<BlockSelectController>().Disable();
		}
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
		const voxelPos = Dependency<BlockSelectController>().SelectedBlockPosition;
		if (!voxelPos) {
			return;
		}
		Dependency<BlockInteractController>().PerformBlockHit(this.entity, this.meta.breakBlock, voxelPos, true);
	}
}
