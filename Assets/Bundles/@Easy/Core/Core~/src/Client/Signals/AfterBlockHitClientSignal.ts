import { Entity } from "Shared/Entity/Entity";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

export class AfterBlockHitClientSignal {
	private blockId: string | undefined;

	constructor(
		public readonly pos: Vector3,
		public readonly blockRuntimeId: number,
		public readonly entity: Entity | undefined,
		public readonly damage: number,
		public readonly broken: boolean,
	) {}

	public GetBlockId(): string {
		if (this.blockId) {
			return this.blockId;
		}
		this.blockId = WorldAPI.GetMainWorld()!.GetIdFromVoxelId(this.blockRuntimeId);
		return this.blockId;
	}
}
