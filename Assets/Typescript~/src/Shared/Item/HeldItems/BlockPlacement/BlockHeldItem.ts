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

		//Load the blocks mesh
		if (this.meta.block?.blockId) {
			const blockDefinition = WorldAPI.GetMainWorld().GetBlockDefinition(this.meta.block.blockId);
			const blockGO = MeshProcessor.ProduceSingleBlock(
				this.meta.block.blockId,
				WorldAPI.GetMainWorld().voxelWorld,
			);
			const gameObjects = this.entity.accessoryBuilder.GetAccessories(AccessorySlot.RightHand);
			blockGO.transform.SetParent(gameObjects.GetValue(0).transform);
			blockGO.transform.localPosition = new Vector3(0, 0, 0);
			const scale = 1;
			blockGO.transform.localScale = new Vector3(scale, scale, scale);
			blockGO.transform.localRotation = Quaternion.identity;
			blockGO.transform.Rotate(new Vector3(90, 90, 0));
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
