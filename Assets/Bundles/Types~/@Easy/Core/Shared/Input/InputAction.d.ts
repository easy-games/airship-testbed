import { Binding } from "./Binding";
import { ModifierKey } from "./InputUtil";
export interface SerializableAction {
    /**
     *
     */
    name: string;
    /**
     *
     */
    primaryKey: Key;
    /**
     *
     */
    modifierKey: ModifierKey;
    /**
     *
     */
    mouseButton: MouseButton;
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
    binding: Binding;
    /**
     *
     */
    secondaryBinding?: Binding;
    /**
     *
     */
    category?: string;
}
export declare class InputActionConfig {
    /**
     *
     */
    secondaryBinding?: Binding;
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
    defaultBinding: Binding;
    /**
     *
     */
    binding: Binding;
    /**
     *
     */
    category: string;
    /**
     *
     */
    isSecondary: boolean;
    constructor(name: string, binding: Binding, isSecondary: boolean, category?: string);
    /**
     *
     * @param newKeybind
     */
    UpdateBinding(newBinding: Binding): void;
    /**
     *
     */
    UnsetBinding(): void;
    /**
     *
     */
    ResetBinding(): void;
    /**
     *
     * @returns
     */
    IsDesktopPeripheral(): boolean;
    /**
     *
     * @returns
     */
    IsComplexBinding(): boolean;
    /**
     *
     * @param otherAction
     * @returns
     */
    DoBindingsMatch(otherAction: InputAction): boolean;
    /**
     *
     * @returns
     */
    Serialize(): SerializableAction;
}
