import { Entity } from "Shared/Entity/Entity";
import { ItemType } from "Shared/Item/ItemType";
import { Cancellable } from "Shared/Util/Cancellable";

export class BeforeBlockPlacedSignal extends Cancellable {
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
