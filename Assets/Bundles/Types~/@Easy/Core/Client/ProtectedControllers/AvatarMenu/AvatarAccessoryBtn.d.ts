/// <reference types="compiler-types" />
export default class AvatarAccessoryBtn extends AirshipBehaviour {
    iconImage: Image;
    button: Button;
    labelText: TextMeshProUGUI;
    bgImage: Image;
    equippedBadge: GameObject;
    classId: string;
    instanceId: string;
    noColorChanges: boolean;
    private bin;
    private selected;
    Start(): void;
    OnEnable(): void;
    SetText(label: string): void;
    SetBGColor(newColor: Color): void;
    SetSelected(val: boolean): void;
    GetSelected(): boolean;
    SetEnabled(enabled: boolean): void;
}
