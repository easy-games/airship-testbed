import { Binding } from "./Binding";
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
    [key in ModifierKey]: Key;
};
/**
 *
 */
export declare const KeyCodeModifierTable: {
    [key in Key]?: ModifierKey;
};
export declare class InputUtil {
    /**
     *
     * @param primary
     * @returns
     */
    static IsPrimaryValidModifier(primary: Key): boolean;
    /**
     *
     * @param modifier
     * @returns
     */
    static GetKeyFromModifier(modifier: ModifierKey): Key;
    /**
     *
     * @param keyCode
     * @returns
     */
    static GetModifierFromKey(key: Key): ModifierKey | undefined;
    /**
     *
     * @param keybind
     */
    static GetInputTypeFromBinding(binding: Binding, keyType: KeyType): ActionInputType;
}
