/// <reference types="@easy-games/compiler-types" />
export default class MainMenuNavButton extends AirshipBehaviour {
    selected: boolean;
    image: Image;
    trueShadow: TrueShadow;
    Awake(): void;
    Start(): void;
    OnDestroy(): void;
    SetSelected(val: boolean): void;
}
