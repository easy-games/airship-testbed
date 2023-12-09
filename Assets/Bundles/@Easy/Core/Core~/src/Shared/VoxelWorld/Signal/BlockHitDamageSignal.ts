import { Entity } from "Shared/Entity/Entity";
import { BreakBlockDef } from "Shared/Item/ItemDefinitionTypes";
import { Block } from "../Block";

export class BlockHitDamageSignal {
	constructor(
		public damage: number,
		public readonly entity: Entity | undefined,
		public readonly block: Block,
		public readonly blockPos: Vector3,
		public readonly breakBlockMeta: BreakBlockDef | undefined,
	) {}
}
