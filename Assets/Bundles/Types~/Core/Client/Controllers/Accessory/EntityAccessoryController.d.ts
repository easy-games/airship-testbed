import { OnStart } from "@easy-games/flamework-core";
import { LocalEntityController } from "../Character/LocalEntityController";
export declare class EntityAccessoryController implements OnStart {
    private readonly localController;
    private isFirstPerson;
    constructor(localController: LocalEntityController);
    private AutoEquipArmor;
    private HandleAllAccessoryVisibility;
    HandleAccessoryVisibility(activeAccessory: ActiveAccessory): void;
    OnStart(): void;
    private SetFirstPersonLayer;
}
