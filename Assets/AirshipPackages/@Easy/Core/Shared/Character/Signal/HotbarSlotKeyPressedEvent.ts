import { Cancellable } from "../../Util/Cancellable";

/**
 * Fired when a hotbar slot key is pressed
 * Cancel this to prevent the slot from changing.
 * 
 * @param requestedSlot The slot that was requested to be changed to.
 * @param currentSlot The slot currently held by the character.
 */
export class HotbarSlotKeyPressedEvent extends Cancellable {
	constructor(
		public readonly requestedSlot: number,
		public readonly currentSlot: number,
	) {
		super();
	}
}
