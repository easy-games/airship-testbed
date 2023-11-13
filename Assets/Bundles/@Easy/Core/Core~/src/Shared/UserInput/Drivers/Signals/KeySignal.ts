import { Cancellable } from "Shared/Util/Cancellable";

export class KeySignal extends Cancellable {
	constructor(
		/** The KeyCode. */
		public readonly keyCode: KeyCode,

		/** `UIProcessed` is `true` if the key event occurred while a UI object was selected. */
		public readonly uiProcessed: boolean,
	) {
		super();
	}
}
