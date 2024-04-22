/// <reference types="compiler-types" />
export default class BlockedUser extends AirshipBehaviour {
    username: TMP_Text;
    unblockButton: Button;
    private uid;
    private bin;
    Init(uid: string, username: string): void;
    OnEnable(): void;
    OnDisable(): void;
}
