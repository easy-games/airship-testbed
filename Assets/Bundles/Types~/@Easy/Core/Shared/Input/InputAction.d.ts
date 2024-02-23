import { ModifierKey } from "./InputUtil";
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
    secondaryKeybind?: Keybind;
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
    defaultKeybind: Keybind;
    /**
     *
     */
    keybind: Keybind;
    /**
     *
     */
    category: string;
    /**
     *
     */
    isSecondary: boolean;
    constructor(name: string, keybind: Keybind, isSecondary: boolean, category?: string);
    /**
     *
     * @param newKeybind
     */
    UpdateKeybind(newKeybind: Keybind): void;
    /**
     *
     */
    UnsetKeybind(): void;
    /**
     *
     */
    ResetKeybind(): void;
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
