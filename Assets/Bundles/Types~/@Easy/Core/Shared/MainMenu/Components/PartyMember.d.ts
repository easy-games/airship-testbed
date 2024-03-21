/// <reference types="@easy-games/compiler-types" />
import { PublicUser } from "../../SocketIOMessages/PublicUser";
export default class PartyMember extends AirshipBehaviour {
    profileImage: Image;
    usernameText: TMP_Text;
    kickButton: Button;
    private bin;
    Start(): void;
    SetUser(user: PublicUser, asLeader: boolean): void;
    OnDestroy(): void;
}
