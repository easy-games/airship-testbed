import { Entity } from "Shared/Entity/Entity";
import { GroundItem } from "Shared/GroundItem/GroundItem";
import { ItemStack } from "Shared/Inventory/ItemStack";

export class EntityDropItemSignal {
	constructor(
		public readonly entity: Entity,
		public readonly itemStack: ItemStack,
		public readonly groundItem: GroundItem,
	) {}
}
