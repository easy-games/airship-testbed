import { OnStart } from "../../../Shared/Flamework";
import { CoreUIController } from "../../MainMenuControllers/CoreUIController";
export declare class TabListController implements OnStart {
    private readonly coreUIController;
    private tablistGO;
    private tablistCanvas;
    private tablistRefs;
    private tablistContentGO;
    private tablistEntryPrefab;
    private cellsPerRow;
    private rowCount;
    private maxSlots;
    private shown;
    private mouse;
    private showBin;
    private dirty;
    private init;
    private profilePicSprite;
    constructor(coreUIController: CoreUIController);
    OnStart(): void;
    FullUpdate(): void;
    private UpdateEntry;
    SetTitleText(title: string): void;
    Show(): void;
    Hide(force?: boolean): void;
    IsShown(): boolean;
}
