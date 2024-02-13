/// <reference types="@easy-games/compiler-types" />
import { FriendStatus } from "../../../Client/MainMenuControllers/Social/SocketAPI";
import { PublicUser } from "../../SocketIOMessages/PublicUser";
export default class DirectMessagesWindow extends AirshipBehaviour {
    offlineNotice: TMP_Text;
    headerParty: GameObject;
    headerPartyProfilePictures: GameObject;
    profilePicturePrefab: GameObject;
    messagesParent: GameObject;
    headerUser: GameObject;
    messagesContent: GameObject;
    scrollRect: ScrollRect;
    inputField: TMP_InputField;
    Start(): void;
    private Init;
    InitAsFriendChat(user: FriendStatus): void;
    InitAsPartyChat(members: PublicUser[]): void;
    UpdatePartyMembers(members: PublicUser[]): void;
    OnDestroy(): void;
}
