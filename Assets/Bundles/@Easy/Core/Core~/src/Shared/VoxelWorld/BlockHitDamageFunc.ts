import { Entity } from "Shared/Entity/Entity";
import { BreakBlockDef } from "Shared/Item/ItemDefinitionTypes";
import { Block } from "./Block";

export type BlockHitDamageFunc = (
	entity: Entity | undefined,
	block: Block,
	blockPos: Vector3,
	breakBlockDef: BreakBlockDef,
) => number;
