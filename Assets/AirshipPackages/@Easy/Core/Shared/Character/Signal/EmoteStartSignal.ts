import { Cancellable } from "../../Util/Cancellable";

export class EmoteStartSignal extends Cancellable {
	constructor(public readonly emoteId: string) {
		super();
	}
}
