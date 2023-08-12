/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { BreakBlockMeta } from "../Item/ItemMeta";
import { Player } from "../Player/Player";
import { Block } from "./Block";
export declare type BlockHitDamageFunc = (player: Player, block: Block, blockPos: Vector3, breakBlockMeta: BreakBlockMeta) => number;
