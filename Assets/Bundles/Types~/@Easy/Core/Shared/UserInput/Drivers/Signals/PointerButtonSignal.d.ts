import { Cancellable } from "../../../Util/Cancellable";
export declare class PointerButtonSignal extends Cancellable {
    /** Whether or not the button is down. */
    readonly isDown: boolean;
    /** `UIProcessed` is `true` if the key event occurred while a UI object was selected. */
    readonly uiProcessed: boolean;
    constructor(
    /** Whether or not the button is down. */
    isDown: boolean, 
    /** `UIProcessed` is `true` if the key event occurred while a UI object was selected. */
    uiProcessed: boolean);
}
