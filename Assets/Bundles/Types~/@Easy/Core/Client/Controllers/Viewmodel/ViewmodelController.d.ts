import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
export declare class ViewmodelController implements OnStart {
    readonly ViewmodelGo: GameObject;
    readonly ViewmodelTransform: Transform;
    readonly Animancer: AnimancerComponent;
    readonly AccessoryBuilder: AccessoryBuilder;
    readonly BoneTransforms: {
        spineMiddle: Transform;
    };
    constructor();
    OnStart(): void;
}
