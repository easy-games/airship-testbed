import { Dependency } from "@easy-games/flamework-core";
import { BlockSelectController } from "Client/Controllers/BlockInteractions/BlockSelectController";
import { BlockInteractController } from "Client/Controllers/Blocks/BlockInteractController";
import { ProgressBarGraphics } from "../../../UI/ProgressBarGraphics";
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
		Dependency<BlockInteractController>().DamageBlock(this.entity, this.meta.breakBlock, voxelPos, true);
	}
}
