import { Cancellable } from "@Easy/Core/Shared/Util/Cancellable";

export class ScrollSignal extends Cancellable {
	constructor(
		/** Scroll amount. */
		public readonly delta: number,

		/** `UIProcessed` is `true` if the key event occurred while a UI object was selected. */
		public readonly uiProcessed: boolean,
	) {
		super();
	}
}
