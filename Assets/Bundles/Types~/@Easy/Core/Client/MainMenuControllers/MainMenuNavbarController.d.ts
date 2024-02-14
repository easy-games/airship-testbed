import { OnStart } from "../../Shared/Flamework";
import { AuthController } from "./Auth/AuthController";
import { MainMenuController } from "./MainMenuController";
import { UserController } from "./User/UserController";
export declare class MainMenuNavbarController implements OnStart {
    private readonly mainMenuController;
    private readonly userController;
    private readonly authController;
    private refreshButton;
    constructor(mainMenuController: MainMenuController, userController: UserController, authController: AuthController);
    OnStart(): void;
    DoRefresh(): void;
    Setup(): void;
    UpdateProfileSection(): void;
    private UpdateNavButton;
    private Disconnect;
}
