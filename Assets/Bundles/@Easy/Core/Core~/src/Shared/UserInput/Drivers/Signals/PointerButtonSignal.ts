import { Cancellable } from "Shared/Util/Cancellable";

export class PointerButtonSignal extends Cancellable {
	constructor(
		/** Whether or not the button is down. */
		public readonly IsDown: boolean,

		/** `UIProcessed` is `true` if the key event occurred while a UI object was selected. */
		public readonly UIProcessed: boolean,
	) {
		super();
	}
}
