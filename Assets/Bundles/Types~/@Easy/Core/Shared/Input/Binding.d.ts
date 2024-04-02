import { ActionInputType, ModifierKey } from "./InputUtil";
interface KeyBindingConfig {
    isKeyBinding: true;
    key: Key;
    modifierKey: ModifierKey;
}
interface MouseBindingConfig {
    isKeyBinding: false;
    mouseButton: MouseButton;
    modifierKey: ModifierKey;
}
type BindingConfig = KeyBindingConfig | MouseBindingConfig;
export declare class Binding {
    config: BindingConfig;
    static Key(key?: Key, modifierKey?: ModifierKey): Binding;
    static MouseButton(mouseButton: MouseButton, modifierKey?: ModifierKey): Binding;
    static AreEqual(a: Binding, b: Binding): boolean;
    private constructor();
    Update(binding: Binding): void;
    IsKeyBinding(): boolean;
    IsMouseButtonBinding(): boolean;
    Unset(): void;
    IsUnset(): boolean;
    IsComplexBinding(): boolean;
    IsDesktopPeripheral(): boolean;
    GetModifierKey(): Key;
    GetInputType(): ActionInputType;
}
export {};
