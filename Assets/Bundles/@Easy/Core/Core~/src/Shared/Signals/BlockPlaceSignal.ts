import { Entity } from "Shared/Entity/Entity";
import { ItemDef } from "Shared/Item/ItemDefinitionTypes";
import { ItemType } from "Shared/Item/ItemType";
import { ItemUtil } from "../Item/ItemUtil";

export class BlockPlaceSignal {
	public readonly ItemMeta: ItemDef;

	constructor(
		public readonly pos: Vector3,
		public readonly itemType: ItemType,
		public readonly blockId: string,

		/** Will always be undefined on client. */
		public readonly entity?: Entity,
	) {
		this.ItemMeta = ItemUtil.GetItemDef(itemType);
	}
}

export class BlockGroupPlaceSignal {
	constructor(
		public readonly positions: Vector3[],
		public readonly itemTypes: ItemType[],
		public readonly blockIds: string[],

		/** Will always be undefined on client. */
		public readonly entity?: Entity,
	) {}
}
