export declare class InputUtils {
    private static keyCodeMap;
    /**
     * Gets the corresponding string for the given keycode (if possible)
     *
     * E.g. `KeyCode.Alpha1` → `"1"`, `KeyCode.A` → `"A"`, `KeyCode.Equals` → `"="`
     * @param keyCode The keycode
     * @returns A string for the keycode (if applicable) - otherwise `undefined`.
     */
    static GetStringForKeyCode(keyCode: KeyCode): string | undefined;
}
