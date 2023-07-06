import { Entity } from "Shared/Entity/Entity";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { Cancellable } from "Shared/Util/Cancellable";

export class BeforeEntityDropItemSignal extends Cancellable {
	constructor(public readonly Entity: Entity, public readonly ItemStack: ItemStack, public Force: Vector3) {
		super();
	}
}
