import { OnStart } from "@easy-games/flamework-core";
import { PlayerController } from "../Player/PlayerController";
export declare class TabListController implements OnStart {
    private readonly playerController;
    private tablistGO;
    private tablistCanvas;
    private tablistRefs;
    private tablistContentGO;
    private tablistEntryPrefab;
    private cellsPerRow;
    private rowCount;
    private maxSlots;
    private shown;
    constructor(playerController: PlayerController);
    OnStart(): void;
    FullUpdate(): void;
    private UpdateEntry;
    Show(): void;
    Hide(force?: boolean): void;
    IsShown(): boolean;
}
