/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { OnStart } from "@easy-games/flamework-core";
import { EntityController } from "../Entity/EntityController";
export declare class BlockSelectController implements OnStart {
    private readonly entityController;
    private highlightGO;
    SelectedBlockPosition?: Vector3;
    HighlightBlockPosition?: Vector3;
    PlaceBlockPosition?: Vector3;
    IsVoidPlacement: boolean;
    private voidPlane;
    private enabledCount;
    private lastVoidPlaceTime;
    constructor(entityController: EntityController);
    OnStart(): void;
    private CalcSelectedBlock;
    private TryMouseSelect;
    private TryVoidSelect;
    private ResetVariables;
    Enable(): void;
    private DisableAll;
    Disable(): void;
    PlacedVoidBridgeBlock(): void;
}
