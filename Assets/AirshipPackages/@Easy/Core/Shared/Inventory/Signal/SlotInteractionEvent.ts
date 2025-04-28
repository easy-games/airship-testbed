import { Airship } from "../../Airship";
import { Cancellable } from "../../Util/Cancellable";
import { PointerButton } from "../../Util/CanvasAPI";
import Inventory from "../Inventory";

interface InventorySlotEvent { // mainly so documentation applies to all of 'em
	/**
	 * The inventory the event is applying to
	 */
	readonly inventory: Inventory;
	/**
	 * The index of the slot in the inventory this event applies to
	 */
	readonly slotIndex: number;
	/**
	 * Returns true if this event is being triggered on an external inventory
	 */
	IsExternalInventory(): boolean;
	/**
	 * Returns true if this event is being triggered on the local inventory
	 */
	IsLocalInventory(): boolean;
}

export class InventorySlotMouseClickEvent implements InventorySlotEvent {
	public constructor(public readonly inventory: Inventory, public readonly slotIndex: number, public readonly button: PointerButton) {}

	public IsExternalInventory(): boolean {
		return this.inventory === Airship.Inventory.ui?.GetActiveExternalInventory();
	}

	public IsLocalInventory(): boolean {
		return this.inventory === Airship.Inventory.localInventory;
	}
}

export class CancellableInventorySlotInteractionEvent extends Cancellable implements InventorySlotEvent {
	public constructor(public readonly inventory: Inventory, public readonly slotIndex: number) {
		super();
	}

	public IsExternalInventory(): boolean {
		return this.inventory === Airship.Inventory.ui?.GetActiveExternalInventory();
	}

	public IsLocalInventory(): boolean {
		return this.inventory === Airship.Inventory.localInventory;
	}
}

export class SlotDragEndedEvent implements InventorySlotEvent {
	public constructor(
		public readonly inventory: Inventory,
		public readonly slotIndex: number,
		/**
		 * True if the slot was "dropped" on another slot
		 */
		public readonly consumed: boolean,
	) {}

	public IsExternalInventory(): boolean {
		return this.inventory === Airship.Inventory.ui?.GetActiveExternalInventory();
	}

	public IsLocalInventory(): boolean {
		return this.inventory === Airship.Inventory.localInventory;
	}
}
