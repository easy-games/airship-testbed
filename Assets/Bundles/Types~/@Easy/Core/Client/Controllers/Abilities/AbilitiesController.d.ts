/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { AbilityRegistry } from "../../../Shared/Strollers/Abilities/AbilityRegistry";
import { Bin } from "../../../Shared/Util/Bin";
import { AbilityBinding } from "./Class/AbilityBinding";
export declare class AbilitiesController implements OnStart {
    private readonly abilityRegistry;
    private readonly keyboard;
    private primaryAbilitySlots;
    private secondaryAbilitySlots;
    private utilityAbiltySlots;
    private allSlots;
    constructor(abilityRegistry: AbilityRegistry);
    private FindNextAvailableSlot;
    private RegisterAbility;
    private OnKeyboardInputEnded;
    ObserveAbilityBindings(callback: (abilities: ReadonlyArray<AbilityBinding>) => Bin): Bin;
    OnStart(): void;
}
