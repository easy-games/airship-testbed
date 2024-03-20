/// <reference types="@easy-games/compiler-types" />
export default class MobileNavButton extends AirshipBehaviour {
    iconImage: Image;
    selectedSprite: Sprite;
    text: TMP_Text;
    button: Button;
    pageName: string;
    private startingSprite;
    private bin;
    private selected;
    private deselectedColor;
    Start(): void;
    OnEnable(): void;
    SetSelected(selected: boolean): void;
    OnDisable(): void;
}
