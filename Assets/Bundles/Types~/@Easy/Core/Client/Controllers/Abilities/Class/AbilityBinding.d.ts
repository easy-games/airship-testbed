import { AbilitySlot } from "../../../../Shared/Abilities/AbilitySlot";
import { Keyboard } from "../../../../Shared/UserInput";
export declare enum BindingInputState {
    InputBegan = 0,
    InputEnded = 1
}
export declare class BindingInput {
    readonly state: BindingInputState;
    readonly keyCode: KeyCode;
    constructor(state: BindingInputState, keyCode: KeyCode);
}
export type BindingAction = (inputState: BindingInputState, binding: AbilityBinding) => void;
export declare class AbilityBinding {
    private readonly slot;
    private enabled;
    private keyCode;
    private bin;
    private primaryId;
    constructor(slot: AbilitySlot, enabled: boolean, keyCode: KeyCode);
    SetEnabled(enabled: boolean): void;
    BindToId(abilityId: string): void;
    GetKey(): KeyCode;
    GetSlot(): AbilitySlot;
    GetEnabled(): boolean;
    BindToAction(keyboard: Keyboard, action: BindingAction): void;
    Unbind(): void;
    GetBoundId(): string | undefined;
}
