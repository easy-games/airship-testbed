import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { AuthController } from "../../MainMenuControllers/Auth/AuthController";
import { FriendsController } from "../../MainMenuControllers/Social/FriendsController";
import { Player } from "../../../Shared/Player/Player";
export declare class PlayerController implements OnStart {
    private readonly friendsController;
    private readonly authController;
    readonly clientId: number;
    readonly localConnection: NetworkConnection;
    private players;
    constructor(friendsController: FriendsController, authController: AuthController);
    OnStart(): void;
    /**
     * Looks for a player using a case insensitive fuzzy search
     *
     * Specific players can be grabbed using the full discriminator as well - e.g. `Luke#0001` would be a specific player
     * @param searchName The name of the plaeyr
     */
    FuzzyFindFirstPlayerByName(searchName: string): Player | undefined;
    GetPlayerFromClientId(clientId: number): Player | undefined;
    GetPlayerFromUserId(userId: string): Player | undefined;
    GetPlayerFromUsername(name: string): Player | undefined;
    private AddPlayer;
    GetPlayers(): Player[];
}
