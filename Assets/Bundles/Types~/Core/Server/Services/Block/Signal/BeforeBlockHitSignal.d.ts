/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { ItemStack } from "Shared/Inventory/ItemStack";
import { Player } from "Shared/Player/Player";
import { Block } from "Shared/VoxelWorld/Block";
export declare class BeforeBlockHitSignal {
    readonly block: Block;
    readonly blockPos: Vector3;
    readonly player: Player;
    /**
     * To modify the damage you must edit BlockHitDamageCalc()
     */
    readonly damage: number;
    readonly itemInHand: ItemStack;
    constructor(block: Block, blockPos: Vector3, player: Player, 
    /**
     * To modify the damage you must edit BlockHitDamageCalc()
     */
    damage: number, itemInHand: ItemStack);
}
