import { ItemMeta } from "Shared/Item/ItemMeta";
import { ItemType } from "Shared/Item/ItemType";
import { World } from "./World";
import { ItemUtil } from "../Item/ItemUtil";

export class Block {
	public readonly blockId: number;
	public readonly itemType: ItemType | undefined;
	public readonly itemMeta: ItemMeta | undefined;

	constructor(public readonly voxel: number, public readonly world: World) {
		this.blockId = VoxelWorld.VoxelDataToBlockId(voxel);
		this.itemType = ItemUtil.GetItemTypeFromBlockId(this.blockId);
		if (this.itemType) {
			this.itemMeta = ItemUtil.GetItemMeta(this.itemType);
		}
	}

	public IsAir(): boolean {
		return this.blockId === 0;
	}

	public GetBlockDefinition(): BlockDefinition {
		return this.world.GetBlockDefinition(this.blockId)!;
	}

	public GetAverageColor(): Color {
		return this.GetBlockDefinition().averageColor.GetValue(0);
	}
}
