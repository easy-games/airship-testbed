import { Player } from "Shared/Player/Player";
import { Block } from "Shared/VoxelWorld/Block";

export class BeforeBlockHitSignal {
	constructor(
		public readonly block: Block,
		public readonly blockPos: Vector3,
		public readonly player: Player,
		/**
		 * To modify the damage you must edit BlockHitDamageCalc()
		 */
		public readonly damage: number,
		public readonly isGroupEvent: boolean,
	) {}
}

export class BeforeBlockGroupHitSignal {
	constructor(
		public readonly blocks: Block[],
		public readonly blockPositions: Vector3[],
		public readonly player: Player,
		/**
		 * To modify the damage you must edit BlockHitDamageCalc()
		 */
		public readonly damage: number,
	) {}
}
