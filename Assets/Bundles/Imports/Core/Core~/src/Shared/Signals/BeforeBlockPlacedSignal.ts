import { CancellableEvent } from "@easy-games/unity-sync-event";
import { Entity } from "Shared/Entity/Entity";
import { ItemType } from "Shared/Item/ItemType";

export class BeforeBlockPlacedSignal extends CancellableEvent {
	constructor(
		public readonly pos: Vector3,
		public readonly itemType: ItemType,
		public readonly voxel: number,

		/** Will always be undefined on client. */
		public readonly entity?: Entity,
	) {
		super();
	}
}
