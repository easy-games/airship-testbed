import { Player } from "Shared/Player/Player";

export class CustomMoveData {
	constructor(
		/** Player. */
		public readonly player: Player,

		/** The server tick in which the event was created. */
		public readonly tick: number,

		/** The key. */
		public readonly key: string,

		/** The value. */
		public readonly value: unknown,
	) {}
}
