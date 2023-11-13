import { Cancellable } from "Shared/Util/Cancellable";

export class ScrollSignal extends Cancellable {
	constructor(
		/** Scroll amount. */
		public readonly Delta: number,

		/** `UIProcessed` is `true` if the key event occurred while a UI object was selected. */
		public readonly UIProcessed: boolean,
	) {
		super();
	}
}
