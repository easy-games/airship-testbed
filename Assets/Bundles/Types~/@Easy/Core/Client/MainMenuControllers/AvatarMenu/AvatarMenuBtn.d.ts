/// <reference types="compiler-types" />
export default class AvatarMenuBtn extends AirshipBehaviour {
    private readonly highlightColor;
    private readonly normalColor;
    iconImage?: Image;
    button: Button;
    labelText: TextMeshProUGUI;
    bgImage?: Image;
    private bin;
    private selected;
    Start(): void;
    OnEnable(): void;
    Init(label: string, color: Color): void;
    SetText(label: string): void;
    SetButtonColor(newColor: Color): void;
    SetIconColor(newColor: Color): void;
    SetSelected(val: boolean): void;
    SetEnabled(enabled: boolean): void;
}
