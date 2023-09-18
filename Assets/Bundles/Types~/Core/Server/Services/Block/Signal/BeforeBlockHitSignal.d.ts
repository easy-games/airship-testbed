/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { BreakBlockMeta } from "../../../../Shared/Item/ItemMeta";
import { Player } from "../../../../Shared/Player/Player";
import { Block } from "../../../../Shared/VoxelWorld/Block";
export declare class BeforeBlockHitSignal {
    readonly block: Block;
    readonly blockPos: Vector3;
    readonly player: Player;
    /**
     * To modify the damage you must edit BlockHitDamageCalc()
     */
    readonly damage: number;
    readonly breakBlockMeta: BreakBlockMeta;
    constructor(block: Block, blockPos: Vector3, player: Player, 
    /**
     * To modify the damage you must edit BlockHitDamageCalc()
     */
    damage: number, breakBlockMeta: BreakBlockMeta);
}
