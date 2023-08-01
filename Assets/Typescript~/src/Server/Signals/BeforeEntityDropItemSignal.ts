import { Entity } from "Shared/Entity/Entity";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { Cancellable } from "Shared/Util/Cancellable";

export class BeforeEntityDropItemSignal extends Cancellable {
	constructor(public readonly entity: Entity, public readonly itemStack: ItemStack, public velocity: Vector3) {
		super();
	}
}
