/// <reference types="compiler-types" />
import { Signal } from "../../Util/Signal";
export default class ProximityPrompt extends AirshipBehaviour {
    private primaryText;
    secondaryText: string;
    actionName: string;
    maxRange: number;
    mouseRaycastTarget: boolean;
    canvas: Canvas;
    primaryTextLabel: TMP_Text;
    secondaryTextLabel: TMP_Text;
    keybindTextLabel: TMP_Text;
    backgroundImg: Image;
    button: Button;
    touchIcon: Image;
    id: number;
    /** On activated signal. */
    onActivated: Signal<void>;
    /** On entered proximity signal. */
    onShown: Signal<void>;
    /** On exited proximity signal. */
    onHidden: Signal<void>;
    private shownBin;
    private bin;
    private shown;
    OnEnable(): void;
    OnDisable(): void;
    KeyDown(): void;
    KeyUp(): void;
    SetPrimaryText(val: string): void;
    SetSecondaryText(val: string): void;
    SetMaxRange(val: number): void;
    /** Called when prompt activates. */
    Activate(): void;
    Hide(instant?: boolean): void;
    Show(): void;
    IsShown(): boolean;
}
