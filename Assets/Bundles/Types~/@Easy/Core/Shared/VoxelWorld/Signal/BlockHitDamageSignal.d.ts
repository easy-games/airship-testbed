/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import Character from "../../Character/Character";
import { BreakBlockDef } from "../../Item/ItemDefinitionTypes";
import { Block } from "../Block";
export declare class BlockHitDamageSignal {
    damage: number;
    readonly character: Character | undefined;
    readonly block: Block;
    readonly blockPos: Vector3;
    readonly breakBlockMeta: BreakBlockDef | undefined;
    constructor(damage: number, character: Character | undefined, block: Block, blockPos: Vector3, breakBlockMeta: BreakBlockDef | undefined);
}
