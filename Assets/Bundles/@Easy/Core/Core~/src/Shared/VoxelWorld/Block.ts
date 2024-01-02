import { ItemDef } from "Shared/Item/ItemDefinitionTypes";
import { ItemType } from "../Item/ItemType";
import { ItemUtil } from "../Item/ItemUtil";
import { World } from "./World";

export class Block {
	public readonly BlockId: string;
	public readonly RuntimeBlockId: number;
	public readonly ItemType: ItemType | undefined;
	public readonly ItemDef: ItemDef | undefined;

	constructor(public readonly voxel: number, public readonly world: World) {
		this.RuntimeBlockId = VoxelWorld.VoxelDataToBlockId(voxel);
		this.BlockId = world.voxelWorld.blocks.GetStringIdFromBlockId(this.RuntimeBlockId);
		this.ItemType = ItemUtil.GetItemTypeFromStringId(world.GetIdFromVoxelId(this.RuntimeBlockId));
		if (this.ItemType) {
			this.ItemDef = ItemUtil.GetItemDef(this.ItemType);
		}
	}

	public IsCrop() {
		return this.ItemDef?.cropBlock !== undefined;
	}

	public IsAir(): boolean {
		return this.RuntimeBlockId === 0;
	}

	public GetBlockDefinition(): BlockDefinition {
		return this.world.GetBlockDefinition(this.RuntimeBlockId)!;
	}

	public GetAverageColor(): Color {
		return this.GetBlockDefinition().averageColor.GetValue(0);
	}
}
