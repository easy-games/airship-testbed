import { Entity } from "@Easy/Core/Shared/Entity/Entity";
import { Cancellable } from "@Easy/Core/Shared/Util/Cancellable";
import { ItemType } from "../../../../Bundles/@Easy/Core/Core~/src/Shared/Item/ItemType";

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
