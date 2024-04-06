/// <reference types="compiler-types" />
export default class BlockedGame extends AirshipBehaviour {
    gameName: TMP_Text;
    unblockButton: Button;
    private gameId;
    private bin;
    Init(gameId: string, gameName: string): void;
    OnEnable(): void;
    OnDisable(): void;
}
