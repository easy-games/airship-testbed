import { Cancellable } from "../../../Util/Cancellable";
export declare class KeySignal extends Cancellable {
    /** The keyboard key. */
    readonly key: Key;
    /** `UIProcessed` is `true` if the key event occurred while a UI object was selected. */
    readonly uiProcessed: boolean;
    constructor(
    /** The keyboard key. */
    key: Key, 
    /** `UIProcessed` is `true` if the key event occurred while a UI object was selected. */
    uiProcessed: boolean);
}
