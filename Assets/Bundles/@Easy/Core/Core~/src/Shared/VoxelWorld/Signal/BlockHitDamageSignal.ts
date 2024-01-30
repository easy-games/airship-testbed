import Character from "Shared/Character/Character";
import { BreakBlockDef } from "Shared/Item/ItemDefinitionTypes";
import { Block } from "../Block";

export class BlockHitDamageSignal {
	constructor(
		public damage: number,
		public readonly character: Character | undefined,
		public readonly block: Block,
		public readonly blockPos: Vector3,
		public readonly breakBlockMeta: BreakBlockDef | undefined,
	) {}
}
