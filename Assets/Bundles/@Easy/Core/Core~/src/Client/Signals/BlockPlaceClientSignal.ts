import Character from "Shared/Character/Character";
import { Block } from "Shared/VoxelWorld/Block";

export class BlockPlaceClientSignal {
	constructor(
		public readonly pos: Vector3,
		public readonly block: Block,
		public readonly placer: Character | undefined,
		public readonly isGroupEvent: boolean,
	) {}
}
