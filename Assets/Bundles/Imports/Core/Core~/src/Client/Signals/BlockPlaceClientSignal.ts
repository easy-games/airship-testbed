import { Entity } from "Shared/Entity/Entity";
import { Block } from "Shared/VoxelWorld/Block";

export class BlockPlaceClientSignal {
	constructor(
		public readonly pos: Vector3,
		public readonly block: Block,
		public readonly placer: Entity | undefined,
	) {}
}

export class BlockGroupPlaceClientSignal {
	constructor(
		public readonly pos: Vector3[],
		public readonly block: Block[],
		public readonly placer: Entity | undefined,
	) {}
}
