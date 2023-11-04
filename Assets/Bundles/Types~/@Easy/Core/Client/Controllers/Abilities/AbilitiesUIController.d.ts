import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { CoreUIController } from "../UI/CoreUIController";
export declare class AbilitiesUIController implements OnStart {
    readonly coreUIController: CoreUIController;
    private abilitySlots;
    private canvas;
    private abilitiesRefs;
    private abilitybarContent;
    constructor(coreUIController: CoreUIController);
    private UpdateAbilityBarSlot;
    private SetupAbilityBar;
    OnStart(): void;
}
