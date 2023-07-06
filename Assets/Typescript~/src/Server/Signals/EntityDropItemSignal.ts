import { Entity } from "Shared/Entity/Entity";
import { ItemStack } from "Shared/Inventory/ItemStack";

export class EntityDropItemSignal {
	constructor(
		public readonly Entity: Entity,
		public readonly ItemStack: ItemStack,
		public readonly groundItemGO: GameObject,
	) {}
}
