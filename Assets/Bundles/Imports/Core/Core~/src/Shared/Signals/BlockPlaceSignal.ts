import { Entity } from "Shared/Entity/Entity";
import { ItemMeta } from "Shared/Item/ItemMeta";
import { ItemType } from "Shared/Item/ItemType";
import { ItemUtil } from "../Item/ItemUtil";

export class BlockPlaceSignal {
	public readonly itemMeta: ItemMeta;

	constructor(
		public readonly pos: Vector3,
		public readonly itemType: ItemType,
		public readonly voxel: number,

		/** Will always be undefined on client. */
		public readonly entity?: Entity,
	) {
		this.itemMeta = ItemUtil.GetItemMeta(itemType);
	}
}
