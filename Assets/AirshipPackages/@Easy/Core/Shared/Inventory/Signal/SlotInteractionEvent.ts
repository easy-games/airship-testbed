import Inventory from "../Inventory";

export class SlotInteractionEvent {
	public constructor(public readonly inventory: Inventory, public readonly slotIndex: number) {}
}
