import { Cancellable } from "../../../Util/Cancellable";
export declare class KeySignal extends Cancellable {
    /** The KeyCode. */
    readonly keyCode: KeyCode;
    /** `UIProcessed` is `true` if the key event occurred while a UI object was selected. */
    readonly uiProcessed: boolean;
    constructor(
    /** The KeyCode. */
    keyCode: KeyCode, 
    /** `UIProcessed` is `true` if the key event occurred while a UI object was selected. */
    uiProcessed: boolean);
}
