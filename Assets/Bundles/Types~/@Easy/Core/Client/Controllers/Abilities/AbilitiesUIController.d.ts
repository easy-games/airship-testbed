import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { CoreUIController } from "../UI/CoreUIController";
import { AbilitiesController } from "./AbilitiesController";
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
}
export declare class AbilitiesUIController implements OnStart {
    readonly coreUIController: CoreUIController;
    readonly abilitiesController: AbilitiesController;
    private abilitySlots;
    private canvas;
    private abilitiesRefs;
    private abilitybarContent;
    private castbar;
    private castbarText;
    constructor(coreUIController: CoreUIController, abilitiesController: AbilitiesController);
    private slotCooldowns;
    private UpdateAbilityBarSlot;
    private SetupAbilityBar;
    OnStart(): void;
}
