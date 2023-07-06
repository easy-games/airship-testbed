import { Dependency } from "@easy-games/flamework-core";
import { WorldAPI } from "../../../VoxelWorld/WorldAPI";
import { HeldItem } from "../HeldItem";
//Dependencies
import { BlockSelectController } from "../../../../Client/Controllers/Global/BlockInteractions/BlockSelectController";
import { DenyRegionController } from "../../../../Client/Controllers/Global/BlockInteractions/DenyRegionController";
import { LocalEntityController } from "../../../../Client/Controllers/Global/Character/LocalEntityController";
import { Network } from "../../../Network";
import { Block } from "../../../VoxelWorld/Block";
import { Entity } from "../../../Entity/Entity";

export class BlockHeldItem extends HeldItem {
	private characterLayerMask = LayerMask.GetMask("Character");

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
		//Only run for local player
		if (this.entity.IsLocalCharacter()) {
			//Try to place a block
			if (this.TryPlaceBlock()) {
				//Only play use animations if we actually think we can place a block
				super.OnUseClient(useIndex);
			}
		}
	}

	private TryPlaceBlock(): boolean {
		if (!this.meta.block) {
			return false;
		}

		const blockSelectController = Dependency<BlockSelectController>();
		const placePosition = blockSelectController.PlaceBlockPosition;
		const isVoidPlacement = blockSelectController.IsVoidPlacement;
		if (!placePosition) {
			return false;
		}

		// Make sure this position is valid within the playable area
		if (Dependency<DenyRegionController>().InDenyRegion(placePosition)) {
			return false;
		}

		// Prevent placing in an entity's head
		// const collider = this.entity.references.characterCollider;
		// const bounds = collider.bounds;
		// const size = bounds.size;
		const colliders = Physics.OverlapBox(
			placePosition.add(new Vector3(0.5, 0.5, 0.5)),
			new Vector3(0.5, 0.5, 0.5),
			Quaternion.identity,
			this.characterLayerMask,
		);
		for (let i = 0; i < colliders.Length; i++) {
			const collider = colliders.GetValue(i);
			const center = collider.bounds.center;
			if (placePosition.y + 0.5 > center.y) {
				return false;
			}
		}

		// Write the voxel at the predicted position
		WorldAPI.GetMainWorld().PlaceBlockById(placePosition, this.meta.block.blockId!, {
			placedByEntityId: this.entity.id,
		});

		Dependency<LocalEntityController>().AddToMoveData("PlaceBlock", {
			pos: placePosition,
			itemType: this.meta.ItemType,
		});
		if (isVoidPlacement) {
			blockSelectController.PlacedVoidBridgeBlock();
		}
		return true;
	}
}
