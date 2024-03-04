/// <reference types="@easy-games/compiler-types" />
export default class AirshipButton extends AirshipBehaviour {
    private bin;
    private disabled;
    private image;
    private button;
    private startingColor;
    private loading;
    clickType: number;
    disabledColorHex: string;
    loadingIndicator?: GameObject;
    Awake(): void;
    Start(): void;
    SetLoading(loading: boolean): void;
    SetDisabled(disabled: boolean): void;
    PlayClickEffect(): void;
    OnDestroy(): void;
}
