import { Dependency } from "@easy-games/flamework-core";
import { BlockSelectController } from "Client/Controllers/BlockInteractions/BlockSelectController";
import { Bin } from "Shared/Util/Bin";
import { HeldItem } from "../HeldItem";

export class BlockSelectHeldItem extends HeldItem {
	private bin: Bin = new Bin();
	protected blockSelect?: BlockSelectController;

	override OnEquip() {
		super.OnEquip();
		if (this.Entity.IsLocalCharacter()) {
			this.blockSelect = Dependency<BlockSelectController>();
			this.blockSelect.Enable();
			this.bin.Add(
				this.blockSelect.OnNewBlockSelected.Connect((event) => {
					this.OnBlockSelect(event.selectedPos, event.placedPos, event.highlightedPos);
				}),
			);
		}
	}

	override OnUnEquip() {
		super.OnUnEquip();
		this.bin.Clean();

		if (this.Entity.IsLocalCharacter()) {
			this.blockSelect?.Disable();
		}
	}

	protected OnBlockSelect(
		selectedPos: Vector3 | undefined,
		placedPos: Vector3 | undefined,
		highlightedPos: Vector3 | undefined,
	) {
		this.blockSelect?.ToggleHighlight(this.CanUseBlock(selectedPos, placedPos, highlightedPos));
	}

	protected CanUseBlock(
		selectedPos: Vector3 | undefined,
		placedPos: Vector3 | undefined,
		highlightedPos: Vector3 | undefined,
	): boolean {
		/* print(
			"CanUseBlock. selectedPos: " +
				selectedPos +
				", placedPos: " +
				placedPos +
				", highlightedPos: " +
				highlightedPos,
		); */
		return true;
	}
}
