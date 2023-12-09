import { ItemDef } from "../Item/ItemDefinitionTypes";
import { ItemType } from "../Item/ItemType";
import { World } from "./World";
export declare class Block {
    readonly voxel: number;
    readonly world: World;
    readonly blockId: string;
    readonly runtimeBlockId: number;
    readonly itemType: ItemType | undefined;
    readonly itemDef: ItemDef | undefined;
    constructor(voxel: number, world: World);
    IsCrop(): boolean;
    IsAir(): boolean;
    GetBlockDefinition(): BlockDefinition;
    GetAverageColor(): Color;
}
