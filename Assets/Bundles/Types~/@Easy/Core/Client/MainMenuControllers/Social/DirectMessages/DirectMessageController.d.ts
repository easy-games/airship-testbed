import { SocketController } from "../../Socket/SocketController";
import { OnStart } from "../../../../Shared/Flamework";
import { Signal } from "../../../../Shared/Util/Signal";
import { MainMenuController } from "../../MainMenuController";
import { FriendsController } from "../FriendsController";
import { MainMenuPartyController } from "../MainMenuPartyController";
import { FriendStatus } from "../SocketAPI";
import { DirectMessage } from "./DirectMessage";
export declare class DirectMessageController implements OnStart {
    private readonly mainMenuController;
    private readonly friendsController;
    private readonly socketController;
    private readonly partyController;
    private incomingMessagePrefab;
    private outgoingMessagePrefab;
    private messagesMap;
    private unreadMessageCounterMap;
    private windowGo?;
    private windowGoRefs?;
    private messagesContentGo?;
    private scrollRect?;
    private offlineNoticeWrapper?;
    private offlineNoticeText?;
    private inputField?;
    private openWindowBin;
    /**
     * Either a userId or "party"
     */
    private openedWindowTarget;
    private doScrollToBottom;
    private inputFieldSelected;
    lastMessagedFriend: FriendStatus | undefined;
    onDirectMessageReceived: Signal<DirectMessage>;
    private partyChatButton;
    onPartyMessageReceived: Signal<DirectMessage>;
    private partyUnreadMessageCount;
    private xPos;
    private yPos;
    private loadedMessagesFromUserIdFromDisk;
    constructor(mainMenuController: MainMenuController, friendsController: FriendsController, socketController: SocketController, partyController: MainMenuPartyController);
    OnStart(): void;
    private IncrementUnreadCounter;
    Setup(): void;
    GetFriendLastMessaged(): FriendStatus | undefined;
    SendDirectMessage(uid: string, message: string): void;
    SendPartyMessage(message: string): void;
    private RenderChatMessage;
    UpdateOfflineNotice(friendStatus: FriendStatus): void;
    OpenFriend(uid: string): void;
    OpenParty(): void;
    private ClearUnreadBadge;
    private GetMessages;
    Close(): void;
}
