import { Entity } from "Imports/Core/Shared/Entity/Entity";
import { Block } from "Imports/Core/Shared/VoxelWorld/Block";

export class BlockPlaceClientSignal {
	constructor(
		public readonly pos: Vector3,
		public readonly block: Block,
		public readonly placer: Entity | undefined,
		/**
		 * True if this signal was fired while the map is being built
		 */
		public readonly isLoadingPhase: boolean,
	) {}
}
