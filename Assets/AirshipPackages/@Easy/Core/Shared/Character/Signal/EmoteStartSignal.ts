import { Cancellable } from "../../Util/Cancellable";

export class EmoteStartSignal extends Cancellable {
	constructor(public emoteId: string) {
		super();
	}
}
