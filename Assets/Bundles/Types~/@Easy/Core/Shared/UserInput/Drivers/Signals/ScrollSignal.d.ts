import { Cancellable } from "../../../Util/Cancellable";
export declare class ScrollSignal extends Cancellable {
    /** Scroll amount. */
    readonly delta: number;
    /** `UIProcessed` is `true` if the key event occurred while a UI object was selected. */
    readonly uiProcessed: boolean;
    constructor(
    /** Scroll amount. */
    delta: number, 
    /** `UIProcessed` is `true` if the key event occurred while a UI object was selected. */
    uiProcessed: boolean);
}
