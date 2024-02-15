import { OnStart } from "../../../Shared/Flamework";
export declare class ViewmodelController implements OnStart {
    readonly viewmodelGo: GameObject;
    readonly viewmodelTransform: Transform;
    readonly animancer: AnimancerComponent;
    readonly accessoryBuilder: AccessoryBuilder;
    readonly rig: CharacterRig;
    constructor();
    OnStart(): void;
}
