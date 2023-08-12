import { BreakBlockMeta } from "../Item/ItemMeta";
import { Player } from "../Player/Player";
import { Block } from "./Block";

export type BlockHitDamageFunc = (
	player: Player,
	block: Block,
	blockPos: Vector3,
	breakBlockMeta: BreakBlockMeta,
) => number;
