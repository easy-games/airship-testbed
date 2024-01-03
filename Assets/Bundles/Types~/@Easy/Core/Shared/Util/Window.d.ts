import { Signal } from "./Signal";
export declare class Window {
    private static proxy;
    static focusChanged: Signal<[hasFocus: boolean]>;
    static HasFocus(): boolean;
}
