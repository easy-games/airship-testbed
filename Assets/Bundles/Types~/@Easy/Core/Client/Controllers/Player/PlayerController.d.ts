import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { AuthController } from "../../MainMenuControllers/Auth/AuthController";
import { FriendsController } from "../../MainMenuControllers/Social/FriendsController";
import { Player } from "../../../Shared/Player/Player";
export declare class PlayerController implements OnStart {
    private readonly friendsController;
    private readonly authController;
    readonly LocalConnection: NetworkConnection;
    private players;
    constructor(friendsController: FriendsController, authController: AuthController);
    OnStart(): void;
    GetPlayerFromClientId(clientId: number): Player | undefined;
    GetPlayerFromUserId(userId: string): Player | undefined;
    GetPlayerFromUsername(name: string): Player | undefined;
    private AddPlayer;
    GetPlayers(): Player[];
}
