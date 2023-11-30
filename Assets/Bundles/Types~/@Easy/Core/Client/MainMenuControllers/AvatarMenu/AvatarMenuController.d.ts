import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { MainMenuController } from "../MainMenuController";
export declare class AvatarMenuController implements OnStart {
    private readonly mainMenuController;
    constructor(mainMenuController: MainMenuController);
    OnStart(): void;
}
