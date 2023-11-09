import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { CoreUIController } from "../UI/CoreUIController";
import { AbilitiesController } from "./AbilitiesController";
export interface ClientAbilityState {
    name: string;
    icon: string | undefined;
    charges: number | undefined;
    keybinding: KeyCode | undefined;
}
export declare class AbilitiesUIController implements OnStart {
    readonly coreUIController: CoreUIController;
    readonly abilitiesController: AbilitiesController;
    private abilitySlots;
    private canvas;
    private abilitiesRefs;
    private abilitybarContent;
    private castbar;
    constructor(coreUIController: CoreUIController, abilitiesController: AbilitiesController);
    private UpdateAbilityBarSlot;
    private SetupAbilityBar;
    OnStart(): void;
}
