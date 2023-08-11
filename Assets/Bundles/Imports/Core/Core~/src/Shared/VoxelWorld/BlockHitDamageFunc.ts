import { BreakBlockMeta } from "Shared/Item/ItemMeta";
import { Player } from "Shared/Player/Player";
import { Block } from "./Block";

export type BlockHitDamageFunc = (
	player: Player,
	block: Block,
	blockPos: Vector3,
	breakBlockMeta: BreakBlockMeta,
) => number;
