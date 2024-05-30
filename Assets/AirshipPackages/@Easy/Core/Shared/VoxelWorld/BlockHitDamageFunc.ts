import Character from "@Easy/Core/Shared/Character/Character";
import { BreakBlockDef } from "@Easy/Core/Shared/Item/ItemDefinitionTypes";
import { Block } from "./Block";

export type BlockHitDamageFunc = (
	character: Character | undefined,
	block: Block,
	blockPos: Vector3,
	breakBlockDef: BreakBlockDef,
) => number;
