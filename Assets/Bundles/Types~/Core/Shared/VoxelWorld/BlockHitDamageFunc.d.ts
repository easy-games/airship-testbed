/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { BreakBlockMeta } from "Shared/Item/ItemMeta";
import { Player } from "Shared/Player/Player";
import { Block } from "./Block";
export declare type BlockHitDamageFunc = (player: Player, block: Block, blockPos: Vector3, breakBlockMeta: BreakBlockMeta) => number;
