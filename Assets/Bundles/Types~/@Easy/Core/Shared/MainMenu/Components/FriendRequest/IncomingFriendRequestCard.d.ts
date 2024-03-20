/// <reference types="compiler-types" />
import { User } from "../../../../Client/MainMenuControllers/User/User";
export default class IncomingFriendRequestCard extends AirshipBehaviour {
    usernameText: TMP_Text;
    profileImage: Image;
    acceptButton: Button;
    declineButton: Button;
    private user;
    private bin;
    Start(): void;
    Init(user: User): void;
    private HandleResult;
    OnDestroy(): void;
}
