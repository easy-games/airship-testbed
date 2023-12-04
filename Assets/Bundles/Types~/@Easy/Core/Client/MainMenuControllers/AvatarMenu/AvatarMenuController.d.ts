import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { MainMenuController } from "../MainMenuController";
export declare class AvatarMenuController implements OnStart {
    private readonly mainMenuController;
    private tweenDuration;
    private AvatarRefKey;
    private refs?;
    private navBars?;
    private mainNavBtns?;
    constructor(mainMenuController: MainMenuController);
    OnStart(): void;
    private SelectMainNav;
}
