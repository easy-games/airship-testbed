import { Cancellable } from "Shared/Util/Cancellable";

export class KeySignal extends Cancellable {
	constructor(
		/** The keyboard key. */
		public readonly key: Key,

		/** `UIProcessed` is `true` if the key event occurred while a UI object was selected. */
		public readonly uiProcessed: boolean,
	) {
		super();
	}
}
