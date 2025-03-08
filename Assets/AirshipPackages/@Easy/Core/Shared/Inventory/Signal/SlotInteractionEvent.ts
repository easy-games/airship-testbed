import { Cancellable } from "../../Util/Cancellable";
import Inventory from "../Inventory";

export class SlotInteractionEvent {
	public constructor(public readonly inventory: Inventory, public readonly slotIndex: number) {}
}

export class CancellableSlotInteractionEvent extends Cancellable {
	public constructor(public readonly inventory: Inventory, public readonly slotIndex: number) {
		super();
	}
}

export class SlotDragEndedEvent {
	public constructor(
		/**
		 * The inventory
		 */
		public readonly inventory: Inventory,
		/**
		 * The slot index
		 */
		public readonly slotIndex: number,
		/**
		 * True if the slot was "dropped" on another slot
		 */
		public readonly consumed: boolean,
	) {}
}
