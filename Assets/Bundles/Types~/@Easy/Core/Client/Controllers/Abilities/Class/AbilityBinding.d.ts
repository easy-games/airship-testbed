import { AbilityDto } from "../../../../Shared/Abilities/Ability";
import { AbilitySlot } from "../../../../Shared/Abilities/AbilitySlot";
import { Keyboard } from "../../../../Shared/UserInput";
import { Signal } from "../../../../Shared/Util/Signal";
import { ClientAbilityCooldownState, ClientAbilityState } from "../AbilityUIController";
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
    private active;
    private boundTo;
    private cooldownState;
    readonly bindingStateChanged: Signal<{
        oldState: ClientAbilityState | undefined;
        newState: ClientAbilityState | undefined;
    }>;
    constructor(slot: AbilitySlot, enabled: boolean, keyCode: KeyCode);
    /**
     * Sets whether or not this ability binding is enabled
     */
    SetEnabled(enabled: boolean): void;
    /**
     * Sets this binding as active (used for UI effects primarily)
     * @param active True if active
     * @internal
     */
    SetActive(active: boolean): void;
    /**
     * Grab the ability state for the core UI
     * @internal Core API
     */
    ToAbilityState(): ClientAbilityState | undefined;
    /**
     * Sets this ability slot's cooldown state
     * @param cooldown The cooldown state - or undefined if no cooldown active
     */
    SetCooldown(cooldown: ClientAbilityCooldownState | undefined): void;
    /**
     * Binds the given ability to this binding slot for this client
     * @param abilityDto The ability data to bind
     * @internal Core API
     */
    BindTo(abilityDto: AbilityDto): void;
    /**
     * Gets the key code bound to this ability binding
     * @returns The key code bound to this binding
     */
    GetKey(): KeyCode;
    /**
     * Gets the slot of this binding
     * @returns The slot
     */
    GetSlot(): AbilitySlot;
    GetEnabled(): boolean;
    IsActive(): boolean;
    /**
     * Bind a callback function to this slot
     * @param keyboard The keyboard
     * @param action The action
     * @internal Core API
     */
    BindToAction(keyboard: Keyboard, action: BindingAction): void;
    /**
     * Unbind this ability slot
     * @internal Core API
     */
    Unbind(): void;
    /**
     * Gets the bound ability of this slot
     * @returns The bound ability data
     */
    GetBound(): AbilityDto | undefined;
}
