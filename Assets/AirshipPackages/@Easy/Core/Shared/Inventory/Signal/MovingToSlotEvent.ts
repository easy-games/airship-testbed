import { Airship } from "../../Airship";
import { Cancellable } from "../../Util/Cancellable";
import Inventory from "../Inventory";

export class MovingToSlotEvent extends Cancellable {
	/**
	 * Allows merging of stacks if they have the same `itemType`
	 *
	 * @default true
	 */
	public allowMerging = true;

	public constructor(
		/**
		 * The inventory of the source ItemStack
		 */
		public readonly fromInventory: Inventory,
		/**
		 * The index of the source ItemStack
		 */
		public readonly fromSlot: number,
		/**
		 * The inventory of the destination ItemStack
		 */
		public readonly toInventory: Inventory,
		/**
		 * The index of the destination ItemStack
		 */
		public readonly toSlot: number,
		/**
		 * The amount that will be transferred
		 */
		public amount: number,
	) {
		super();
	}

	public GetSourceItemStack() {
		return this.fromInventory.GetItem(this.fromSlot);
	}

	public GetTargetItemStack() {
		return this.toInventory.GetItem(this.toSlot);
	}
}
