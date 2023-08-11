/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Player } from "Shared/Player/Player";
import { Block } from "Shared/VoxelWorld/Block";
import { BreakBlockMeta } from "../Item/ItemMeta";
/**
 * Will return 0 if can't damage.
 */
export declare function BlockHitDamageCalc(player: Player, block: Block, blockPos: Vector3, breakBlockMeta: BreakBlockMeta): number;
