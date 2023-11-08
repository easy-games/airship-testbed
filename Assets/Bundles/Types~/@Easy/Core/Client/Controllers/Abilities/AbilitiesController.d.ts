import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { AbilityRegistry } from "../../../Shared/Strollers/Abilities/AbilityRegistry";
import { AbilityBinding } from "./Class/AbilityBinding";
export declare class AbilitiesController implements OnStart {
    private readonly abilityRegistry;
    private readonly keyboard;
    primaryAbilitySlots: AbilityBinding[];
    secondaryAbilitySlots: AbilityBinding[];
    utilityAbiltySlots: AbilityBinding[];
    constructor(abilityRegistry: AbilityRegistry);
    private FindNextAvailableSlot;
    private RegisterAbility;
    private OnKeyboardInputEnded;
    OnStart(): void;
}
