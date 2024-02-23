import { Keybind } from "./Keybind";
export declare enum KeyType {
    Primary = 0,
    Modifier = 1
}
export declare enum ModifierKey {
    None = 0,
    LeftShift = 1,
    LeftControl = 2,
    LeftAlt = 3
}
export declare enum ActionInputType {
    Keyboard = 0,
    Mouse = 1,
    Gamepad = 2,
    Unbound = 3,
    Unknown = 4
}
/**
 *
 */
export declare const ModifierKeyCodeTable: {
    [key in ModifierKey]: KeyCode;
};
/**
 *
 */
export declare const KeyCodeModifierTable: {
    [key in KeyCode]?: ModifierKey;
};
export declare class InputUtil {
    /**
     *
     * @param primary
     * @returns
     */
    static IsPrimaryValidModifier(primary: KeyCode): boolean;
    /**
     *
     * @param modifier
     * @returns
     */
    static GetKeyCodeFromModifier(modifier: ModifierKey): KeyCode;
    /**
     *
     * @param keyCode
     * @returns
     */
    static GetModifierFromKeyCode(keyCode: KeyCode): ModifierKey | undefined;
    /**
     *
     * @param keybind
     */
    static GetInputTypeFromKeybind(keybind: Keybind, keyType: KeyType): ActionInputType;
}
