import { Dependency } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { BlockSelectController } from "Client/Controllers/BlockInteractions/BlockSelectController";
import { DenyRegionController } from "Client/Controllers/BlockInteractions/DenyRegionController";
import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { WorldAPI } from "../../../VoxelWorld/WorldAPI";
import { BlockSelectHeldItem } from "../BlockPlacement/BlockSelectHeldItem";

export class PlaceBlockEntityHeldItem extends BlockSelectHeldItem {
	private characterLayerMask = LayerMask.GetMask("Character");
	private placementQueued = false;

	override OnEquip() {
		super.OnEquip();
		if (this.blockSelect) {
			// this.blockSelect.highlightOnPlacement = true;
		}

		//Load the blocks mesh
		if (this.itemMeta?.block?.blockId) {
			const world = WorldAPI.GetMainWorld()!;
			const voxelId = world.GetVoxelIdFromId(this.itemMeta.block.blockId);

			const rightHandRens = this.entity.accessoryBuilder.GetAccessoryMeshes(AccessorySlot.RightHand);
			if (rightHandRens && rightHandRens.Length > 0) {
				const blockGO = MeshProcessor.ProduceSingleBlock(voxelId, world.voxelWorld, 2, 5);
				if (blockGO) {
					let heldItemRen = rightHandRens.GetValue(0);
					const meshRen = blockGO.GetComponent<MeshRenderer>();
					const meshFilter = blockGO.GetComponent<MeshFilter>();
					heldItemRen.material = meshRen.material;
					heldItemRen.GetComponent<MeshFilter>().mesh = meshFilter.mesh;
					GameObjectUtil.Destroy(blockGO);
				}
			} else {
				print("Could not produce block", inspect(this.itemMeta.block));
			}
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
		if (this.placementQueued) return false;

		const world = WorldAPI.GetMainWorld();
		if (!world) return false;

		if (!this.itemMeta) return false;

		const blockMeta = this.itemMeta.blockEntity;
		if (!blockMeta) {
			return false;
		}

		const blockSelectController = Dependency<BlockSelectController>();
		const placePosition = blockSelectController.placeBlockPosition;
		const isVoidPlacement = blockSelectController.isVoidPlacement;

		if (!placePosition) {
			return false;
		}

		if (!this.CanUseBlock(undefined, placePosition, undefined)) {
			return false;
		}

		if (blockMeta.requiresFoundation && isVoidPlacement) {
			warn("is void placement");
			return false;
		}

		if (blockMeta.placeOnWhitelist) {
			const belowItemType = world.GetBlockBelow(placePosition).itemType;
			if (!belowItemType || !blockMeta.placeOnWhitelist.includes(belowItemType)) {
				warn("invalid type, expecting ", inspect(blockMeta.placeOnWhitelist), "got", belowItemType ?? "<NONE>");
				return false;
			}
		}

		this.placementQueued = true;
		Dependency<LocalEntityController>().AddToMoveData(
			"PlaceBlockEntity",
			{
				pos: placePosition,
				itemType: this.itemMeta.itemType,
			},
			() => {
				// print("PlaceBlock tick=" + InstanceFinder.TimeManager.LocalTick + " time=" + Time.time);
				this.placementQueued = false;
				// Write the voxel at the predicted position

				// world.PlaceBlockById(placePosition, blockMeta.blockId, {
				// 	placedByEntityId: this.entity.id,
				// 	priority: true,
				// });

				if (isVoidPlacement) {
					blockSelectController.PlacedVoidBridgeBlock();
				}
			},
		);
		return true;
	}

	override CanUseBlock(
		selectedPos: Vector3 | undefined,
		placedPos: Vector3 | undefined,
		highlightedPos: Vector3 | undefined,
	): boolean {
		//print("CanUse PlacedPos: " + placedPos);
		super.CanUseBlock(selectedPos, placedPos, highlightedPos);

		if (!placedPos) {
			return false;
		}

		// Make sure this position is valid within the playable area
		if (Dependency<DenyRegionController>().InDenyRegion(placedPos)) {
			//print("FALSE in deny region");
			return false;
		}

		const block = WorldAPI.GetMainWorld()?.GetBlockAt(placedPos);
		if (block && !block.IsAir()) {
			//print("FALSE Filled block: " + block?.IsAir());
			return false;
		}

		// Prevent placing in an entity's head
		// const collider = this.entity.references.characterCollider;
		// const bounds = collider.bounds;
		// const size = bounds.size;
		const colliders = Physics.OverlapBox(
			placedPos.add(new Vector3(0.5, 0.5, 0.5)),
			new Vector3(0.5, 0.5, 0.5),
			Quaternion.identity,
			this.characterLayerMask,
		);
		for (let i = 0; i < colliders.Length; i++) {
			const collider = colliders.GetValue(i);
			const center = collider.bounds.center;
			if (placedPos.y + 0.5 > center.y) {
				//print("FALSE On entity");
				return false;
			}
		}

		//print("TRUE");
		return true;
	}
}
