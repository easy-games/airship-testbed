/// <reference types="compiler-types" />
import { Signal } from "../../Util/Signal";
export default class ProximityPrompt extends AirshipBehaviour {
    private primaryText;
    secondaryText: string;
    actionName: string;
    maxRange: number;
    canvas: Canvas;
    primaryTextLabel: TMP_Text;
    secondaryTextLabel: TMP_Text;
    keybindTextLabel: TMP_Text;
    backgroundImg: Image;
    button: Button;
    id: number;
    /** On activated signal. */
    onActivated: Signal<void>;
    /** On entered proximity signal. */
    onProximityEnter: Signal<void>;
    /** On exited proximity signal. */
    onProximityExit: Signal<void>;
    private canActivate;
    private activatedBin;
    private bin;
    private stateChangeBin;
    OnEnable(): void;
    OnDisable(): void;
    KeyDown(): void;
    KeyUp(): void;
    SetCanActivate(canActivate: boolean): void;
    IsHighestPriorityPrompt(): boolean;
    SetPrimaryText(val: string): void;
    SetSecondaryText(val: string): void;
    SetMaxRange(val: number): void;
    /** Called when prompt activates. */
    Activate(): void;
    Hide(): void;
    Show(): void;
}
