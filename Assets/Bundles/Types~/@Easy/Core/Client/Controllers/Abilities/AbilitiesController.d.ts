/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { AbilityRegistry } from "../../../Shared/Strollers/Abilities/AbilityRegistry";
import { Bin } from "../../../Shared/Util/Bin";
import { EntityController } from "../Entity/EntityController";
import { AbilityBinding } from "./Class/AbilityBinding";
export declare class AbilitiesController implements OnStart {
    private readonly abilityRegistry;
    private readonly entityController;
    private readonly keyboard;
    private primaryAbilitySlots;
    private secondaryAbilitySlots;
    private utilityAbiltySlots;
    private allSlots;
    constructor(abilityRegistry: AbilityRegistry, entityController: EntityController);
    private FindNextAvailableSlot;
    private RegisterAbility;
    private UnregisterAbility;
    private OnKeyboardInputEnded;
    ObserveAbilityBindings(callback: (abilities: ReadonlyArray<AbilityBinding>) => Bin): Bin;
    OnStart(): void;
}
