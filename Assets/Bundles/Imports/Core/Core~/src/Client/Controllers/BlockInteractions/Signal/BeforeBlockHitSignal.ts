import { Block } from "Shared/VoxelWorld/Block";

export class BeforeBlockHitSignal {
	constructor(
		public readonly blockPos: Vector3,
		public readonly block: Block,
		public readonly isGroupEvent: boolean,
	) {}
}
