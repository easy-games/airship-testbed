import { ItemDef } from "../Item/ItemDefinitionTypes";
import { World } from "./World";
export declare class Block {
    readonly voxel: number;
    readonly world: World;
    readonly blockId: string;
    readonly runtimeBlockId: number;
    readonly itemType: string | undefined;
    readonly itemDef: ItemDef | undefined;
    constructor(voxel: number, world: World);
    IsCrop(): boolean;
    IsAir(): boolean;
    GetBlockDefinition(): BlockDefinition;
    GetAverageColor(): Color;
}
