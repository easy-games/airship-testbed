import { AbilityDto } from "../../../../Shared/Abilities/Ability";
import { AbilitySlot } from "../../../../Shared/Abilities/AbilitySlot";
import { Keyboard } from "../../../../Shared/UserInput";
import { Signal } from "../../../../Shared/Util/Signal";
import { ClientAbilityState } from "../AbilitiesUIController";
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
    private boundTo;
    readonly BindingStateChanged: Signal<{
        oldState: ClientAbilityState | undefined;
        newState: ClientAbilityState | undefined;
    }>;
    constructor(slot: AbilitySlot, enabled: boolean, keyCode: KeyCode);
    SetEnabled(enabled: boolean): void;
    ToAbilityState(): ClientAbilityState | undefined;
    BindTo(abilityId: AbilityDto): void;
    GetKey(): KeyCode;
    GetSlot(): AbilitySlot;
    GetEnabled(): boolean;
    BindToAction(keyboard: Keyboard, action: BindingAction): void;
    Unbind(): void;
    GetBound(): AbilityDto | undefined;
}
