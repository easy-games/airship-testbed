/// <reference types="compiler-types" />
import { AirshipButtonClickEffect } from "./AirshipButtonClickEffect";
export default class AirshipButton extends AirshipBehaviour {
    private bin;
    private disabled;
    private image;
    private button;
    private startingColor;
    private loading;
    clickEffect: AirshipButtonClickEffect;
    disabledColorHex: string;
    loadingIndicator?: GameObject;
    Awake(): void;
    Start(): void;
    SetLoading(loading: boolean): void;
    SetDisabled(disabled: boolean): void;
    PlayClickEffect(): void;
    OnDestroy(): void;
}
