/// <reference types="compiler-types" />
import { PublicUser } from "../../SocketIOMessages/PublicUser";
export default class PartyMember extends AirshipBehaviour {
    profileImage: RawImage;
    private bin;
    Start(): void;
    SetUser(user: PublicUser, asLeader: boolean): void;
    OnDestroy(): void;
}
