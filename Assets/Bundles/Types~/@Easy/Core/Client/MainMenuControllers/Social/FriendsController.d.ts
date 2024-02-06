import { RightClickMenuController } from "../UI/RightClickMenu/RightClickMenuController";
import { OnStart } from "../../../Shared/Flamework";
import { Signal } from "../../../Shared/Util/Signal";
import { AuthController } from "../Auth/AuthController";
import { MainMenuController } from "../MainMenuController";
import { SocketController } from "../Socket/SocketController";
import { User } from "../User/User";
import { FriendStatus } from "./SocketAPI";
export declare class FriendsController implements OnStart {
    private readonly authController;
    private readonly socketController;
    private readonly mainMenuController;
    private readonly rightClickMenuController;
    friends: User[];
    incomingFriendRequests: User[];
    outgoingFriendRequests: User[];
    friendStatuses: FriendStatus[];
    private renderedFriendUids;
    private statusText;
    private friendBinMap;
    friendStatusChanged: Signal<FriendStatus>;
    private customGameTitle;
    private socialNotification;
    private friendRequestsButton;
    onIncomingFriendRequestsChanged: Signal<void>;
    constructor(authController: AuthController, socketController: SocketController, mainMenuController: MainMenuController, rightClickMenuController: RightClickMenuController);
    OnStart(): void;
    SetIncomingFriendRequests(friendRequests: User[]): void;
    Setup(): void;
    FuzzySearchFriend(name: string): User | undefined;
    GetFriendByUsername(username: string): User | undefined;
    SetStatusText(text: string): void;
    GetStatusText(): string;
    SendStatusUpdate(): void;
    FetchFriends(): void;
    AcceptFriendRequestAsync(username: string): boolean;
    RejectFriendRequestAsync(uid: string): boolean;
    GetFriendGo(uid: string): GameObject | undefined;
    HasOutgoingFriendRequest(userId: string): boolean;
    SendFriendRequest(username: string): boolean;
    UpdateFriendsList(): void;
    GetFriendStatus(uid: string): FriendStatus | undefined;
    UpdateFriendStatusUI(friend: FriendStatus, refs: GameObjectReferences, config: {
        loadImage: boolean;
        includeTag?: boolean;
    }): void;
    /**
     * Allows you to include rich presence for your game in the friends sidebar. This replaces "Playing ___" with whatever you want.
     * Note that the "Playing " will always be prefixed.
     *
     * Example: a customGameTitle of "BedWars | Ranked 5v5 - Aztec" will be shown as "Playing BedWars | Ranked 5v5 - Aztec"
     *
     * @param customGameTitle The text displayed as the game title.
     */
    SetCustomGameTitle(customGameTitle: string | undefined): void;
}
