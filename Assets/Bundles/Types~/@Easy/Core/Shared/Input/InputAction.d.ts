import { ActionInputType, KeyType, ModifierKey } from "./InputUtil";
import { Keybind } from "./Keybind";
export interface SerializableAction {
    /**
     *
     */
    name: string;
    /**
     *
     */
    primaryKey: KeyCode;
    /**
     *
     */
    modifierKey: ModifierKey;
    /**
     *
     */
    category: string;
}
export interface InputActionSchema {
    /**
     *
     */
    name: string;
    /**
     *
     */
    keybind: Keybind;
    /**
     *
     */
    category?: string;
}
export declare class InputAction {
    /**
     *
     */
    static inputActionId: number;
    /**
     *
     */
    id: number;
    /**
     *
     */
    name: string;
    /**
     *
     */
    keybind: Keybind;
    /**
     *
     */
    category: string;
    constructor(name: string, keybind: Keybind, category?: string);
    /**
     *
     * @returns
     */
    GetInputType(keyType: KeyType): ActionInputType;
    /**
     *
     * @returns
     */
    IsDesktopPeripheral(): boolean;
    /**
     *
     * @returns
     */
    IsComplexKeybind(): boolean;
    /**
     *
     * @param otherAction
     * @returns
     */
    DoKeybindsMatch(otherAction: InputAction): boolean;
    /**
     *
     * @returns
     */
    Serialize(): SerializableAction;
}
