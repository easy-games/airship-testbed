import Character from "Shared/Character/Character";
import { BreakBlockDef } from "Shared/Item/ItemDefinitionTypes";
import { Block } from "./Block";

export type BlockHitDamageFunc = (
	character: Character | undefined,
	block: Block,
	blockPos: Vector3,
	breakBlockDef: BreakBlockDef,
) => number;
