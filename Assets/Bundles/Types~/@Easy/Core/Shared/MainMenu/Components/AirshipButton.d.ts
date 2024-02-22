/// <reference types="@easy-games/compiler-types" />
export default class AirshipButton extends AirshipBehaviour {
    clickType: number;
    private bin;
    Start(): void;
    PlayClickEffect(): void;
    OnDestroy(): void;
}
