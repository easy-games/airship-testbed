/// <reference types="compiler-types" />
export default class PartyChatButton extends AirshipBehaviour {
    badgeText: TMP_Text;
    badgeWrapper: GameObject;
    private bin;
    Start(): void;
    SetUnreadCount(amount: number): void;
    OnDestroy(): void;
}
