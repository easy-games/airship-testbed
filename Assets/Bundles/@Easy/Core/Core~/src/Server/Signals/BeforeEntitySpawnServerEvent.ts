import { Player } from "Shared/Player/Player";

export class BeforeEntitySpawnServerEvent {
	constructor(
		public readonly entityId: number,
		public readonly player: Player | undefined,
		public spawnPosition: Vector3,
		public spawnRotation: Quaternion,
	) {}
}
