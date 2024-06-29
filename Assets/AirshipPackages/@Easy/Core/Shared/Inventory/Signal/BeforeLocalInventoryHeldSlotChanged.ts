import { Cancellable } from "../../Util/Cancellable";

export class BeforeLocalInventoryHeldSlotChanged extends Cancellable {
	constructor(public newSlot: number, public oldSlot: number) {
		super();
	}
}
