import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { CoreUIController } from "../UI/CoreUIController";
import { AbilityBindingController } from "./AbilityBindingController";
export interface ClientAbilityCooldownState {
    startTime: number;
    length: number;
    endTime: number;
}
export interface ClientAbilityState {
    name: string;
    icon: string | undefined;
    charges: number | undefined;
    keybinding: KeyCode | undefined;
    cooldown?: ClientAbilityCooldownState;
    active: boolean;
    charging?: boolean;
}
export declare class AbilityUIController implements OnStart {
    readonly coreUIController: CoreUIController;
    readonly abilityBindingController: AbilityBindingController;
    private abilitySlots;
    private canvas;
    private abilitiesRefs;
    private abilitybarContent;
    private castbar;
    private castbarText;
    constructor(coreUIController: CoreUIController, abilityBindingController: AbilityBindingController);
    private slotCooldowns;
    private UpdateAbilityBarSlot;
    private SetupAbilityBar;
    OnStart(): void;
}
