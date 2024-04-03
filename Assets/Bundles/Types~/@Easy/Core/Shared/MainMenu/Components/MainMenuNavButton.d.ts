/// <reference types="compiler-types" />
export default class MainMenuNavButton extends AirshipBehaviour {
    selected: boolean;
    image: Image;
    trueShadow: TrueShadow;
    selectedColor: Color;
    unselectedColor: Color;
    text: TMP_Text;
    iconImage: Image;
    private textColorActive;
    private textColorNormal;
    Awake(): void;
    Start(): void;
    OnDestroy(): void;
    SetSelected(val: boolean): void;
}
