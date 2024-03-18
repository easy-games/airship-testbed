/// <reference types="@easy-games/compiler-types" />
export default class MainMenuNavButton extends AirshipBehaviour {
    selected: boolean;
    image: Image;
    trueShadow: TrueShadow;
    selectedColor: Color;
    unselectedColor: Color;
    Awake(): void;
    Start(): void;
    OnDestroy(): void;
    SetSelected(val: boolean): void;
}
