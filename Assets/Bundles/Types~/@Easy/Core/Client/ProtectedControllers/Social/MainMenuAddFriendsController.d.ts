import { OnStart } from "../../../Shared/Flamework";
import { AuthController } from "../Auth/AuthController";
import { SocketController } from "../Socket/SocketController";
export declare class MainMenuAddFriendsController implements OnStart {
    private readonly authController;
    private readonly socketController;
    private sentRequests;
    private canvas;
    private inputFieldSelected;
    constructor(authController: AuthController, socketController: SocketController);
    OnStart(): void;
    Open(): void;
}
