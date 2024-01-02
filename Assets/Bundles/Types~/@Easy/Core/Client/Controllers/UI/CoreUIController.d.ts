import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
export declare class CoreUIController implements OnStart {
    readonly CoreUIGO: GameObject;
    readonly Refs: GameObjectReferences;
    constructor();
    OnStart(): void;
}
