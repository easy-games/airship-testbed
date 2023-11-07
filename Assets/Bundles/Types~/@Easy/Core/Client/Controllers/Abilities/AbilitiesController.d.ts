/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { AbilityDto } from "../../../Shared/Abilities/Ability";
import { AbilitySlot } from "../../../Shared/Abilities/AbilitySlot";
import { AbilityRegistry } from "../../../Shared/Strollers/Abilities/AbilityRegistry";
interface BoundAbilitySlot {
    abilityId: string;
    enabled: boolean;
    cooldownTimeEnd: number | undefined;
}
export declare class AbilitiesController implements OnStart {
    private readonly abilityRegistry;
    private primaryKeyQueue;
    private secondaryKeyQueue;
    private tertiaryKeyQueue;
    private readonly abilityBoundKeys;
    keyCodeAbilitySlot: Map<KeyCode, AbilitySlot>;
    abilitySlotBinding: Map<AbilitySlot, BoundAbilitySlot>;
    constructor(abilityRegistry: AbilityRegistry);
    /**
     * Attempts to bind the ability to the next available slot
     * @param slot The slot kind to bind this ability to
     * @param ability The ability to bind
     */
    BindAbilityToSlot(slot: AbilitySlot, ability: AbilityDto): void;
    private GetBoundAbilityForKeyCode;
    private OnKeyboardInputEnded;
    OnStart(): void;
}
export {};
