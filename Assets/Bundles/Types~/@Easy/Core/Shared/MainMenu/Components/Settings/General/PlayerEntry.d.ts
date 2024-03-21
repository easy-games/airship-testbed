/// <reference types="compiler-types" />
import { Player } from "../../../../Player/Player";
export default class PlayerEntry extends AirshipBehaviour {
    bgImage: Image;
    profileImage: Image;
    usernameText: TMP_Text;
    addFriendBtn: GameObject;
    private bin;
    OnEnable(): void;
    Init(player: Player): void;
    SetEven(): void;
    OnDisable(): void;
}
