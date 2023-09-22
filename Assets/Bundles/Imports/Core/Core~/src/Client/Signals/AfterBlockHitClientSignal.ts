import { Entity } from "Shared/Entity/Entity";

export class AfterBlockHitClientSignal {
	constructor(
		public readonly pos: Vector3,
		public readonly blockId: number,
		public readonly entity: Entity | undefined,
		public readonly broken: boolean,
		public readonly isGroupEvent: boolean,
	) {}
}
