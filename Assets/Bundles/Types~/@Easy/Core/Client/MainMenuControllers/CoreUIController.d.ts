import { OnStart } from "../../Shared/Flamework";
export declare class CoreUIController implements OnStart {
    readonly coreUIGO: GameObject;
    readonly refs: GameObjectReferences;
    constructor();
    OnStart(): void;
}
