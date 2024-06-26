import { ItemDef } from "@Easy/Core/Shared/Item/ItemDefinitionTypes";
import { ItemUtil } from "../../../Core/Shared/Item/ItemUtil";
import { World } from "./World";

export class Block {
	public readonly blockId: string;
	public readonly runtimeBlockId: number;
	public readonly itemType: string | undefined;
	public readonly itemDef: ItemDef | undefined;

	constructor(
		public readonly voxel: number,
		public readonly world: World,
	) {
		this.runtimeBlockId = VoxelWorld.VoxelDataToBlockId(voxel);
		this.blockId = world.voxelWorld.blocks.GetStringIdFromBlockId(this.runtimeBlockId);
		this.itemType = ItemUtil.GetItemTypeFromStringId(world.GetIdFromVoxelId(this.runtimeBlockId));
		if (this.itemType) {
			this.itemDef = ItemUtil.GetItemDef(this.itemType);
		}
	}

	public IsCrop() {
		return this.itemDef?.cropBlock !== undefined;
	}

	public IsAir(): boolean {
		return this.runtimeBlockId === 0;
	}

	public GetBlockDefinition(): BlockDefinition {
		return this.world.GetBlockDefinition(this.runtimeBlockId)!;
	}

	public GetAverageColor(): Color {
		return this.GetBlockDefinition().averageColor.GetValue(0);
	}
}
