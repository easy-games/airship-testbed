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
     */
    GetModifierKeyCode(): KeyCode;
}
