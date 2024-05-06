import { RightClickMenuController } from "../UI/RightClickMenu/RightClickMenuController";
import { OnStart } from "../../../Shared/Flamework";
import { Signal } from "../../../Shared/Util/Signal";
import { AuthController } from "../Auth/AuthController";
import { MainMenuController } from "../MainMenuController";
import { ClientSettingsController } from "../Settings/ClientSettingsController";
import { SocketController } from "../Socket/SocketController";
import { User } from "../User/User";
import { FriendStatus } from "./SocketAPI";
export declare class FriendsController implements OnStart {
    private readonly authController;
    private readonly socketController;
    private readonly mainMenuController;
    private readonly rightClickMenuController;
    private readonly clientSettingsController;
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
    private socialNotificationBin;
    private friendRequestsButton;
    private socialNotificationKey;
    onIncomingFriendRequestsChanged: Signal<void>;
    private friendsScrollRect;
    constructor(authController: AuthController, socketController: SocketController, mainMenuController: MainMenuController, rightClickMenuController: RightClickMenuController, clientSettingsController: ClientSettingsController);
    AddSocialNotification(key: string, title: string, username: string, onResult: (result: boolean) => void): void;
    ClearSocialNotification(): void;
    FireNotificationKey(key: string): void;
    OnStart(): void;
    SetIncomingFriendRequests(friendRequests: User[]): void;
    Setup(): void;
    FuzzySearchFriend(name: string): User | undefined;
    GetFriendByUsername(username: string): User | undefined;
    SetStatusText(text: string): void;
    GetStatusText(): string;
    SendStatusUpdate(): void;
    FetchFriends(): void;
    AcceptFriendRequestAsync(username: string, userId: string): boolean;
    RejectFriendRequestAsync(userId: string): boolean;
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
