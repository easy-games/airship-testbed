/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Player } from "../Player/Player";
import { Block } from "../VoxelWorld/Block";
import { BreakBlockMeta } from "../Item/ItemMeta";
/**
 * Will return 0 if can't damage.
 */
export declare function BlockHitDamageCalc(player: Player, block: Block, blockPos: Vector3, breakBlockMeta: BreakBlockMeta): number;
