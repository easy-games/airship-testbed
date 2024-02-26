/// <reference types="@easy-games/compiler-types" />
export default class AvatarMenuBtn extends AirshipBehaviour {
    private readonly highlightColor;
    private readonly normalColor;
    iconImage: Image;
    button: Button;
    labelText: TextMeshProUGUI;
    Start(): void;
    Init(label: string, color: Color): void;
    SetText(label: string): void;
    SetButtonColor(newColor: Color): void;
    SetIconColor(newColor: Color): void;
    SetHighlight(highlightOn: boolean): void;
}
