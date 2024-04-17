/// <reference types="compiler-types" />
export declare class InputUtils {
    static keyCodeMap: Record<Key, string>;
    static mouseButtonMap: Record<MouseButton, string>;
    /**
     * Gets the corresponding string for the given key (if possible).
     *
     * E.g. `Key.Digit1` → `"1"`, `Key.A` → `"A"`, `Key.Equals` → `"="`.
     * @param key The key
     * @returns A string for the key (if applicable) - otherwise `undefined`.
     */
    static GetStringForKeyCode(key: Key): string;
    /**
     * Gets the corresponding string for the given mouse button (if possible).
     *
     * E.g. `MouseButton.LeftButton` → `"Left Button"`.
     * @param mouseButton The mouse button
     * @returns A string for the mouse button (if applicable) - otherwise `undefined`.
     */
    static GetStringForMouseButton(mouseButton: MouseButton): string;
}
