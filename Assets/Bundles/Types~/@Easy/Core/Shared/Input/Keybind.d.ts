import { ModifierKey } from "./InputUtil";
export declare class Keybind {
    /**
     *
     */
    primaryKey: KeyCode;
    /**
     *
     */
    modifierKey: ModifierKey;
    constructor(primaryKey: KeyCode, modifierKey?: ModifierKey);
    /**
     *
     * @returns
     */
    IsComplexKeybind(): boolean;
    /**
     *
     */
    GetModifierKeyCode(): KeyCode;
    /**
     *
     * @param newKeybind
     */
    Update(newKeybind: Keybind): void;
    /**
     *
     */
    Unset(): void;
    /**
     *
     * @returns
     */
    IsUnset(): boolean;
}
