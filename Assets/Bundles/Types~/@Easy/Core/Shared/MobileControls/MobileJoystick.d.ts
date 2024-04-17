/// <reference types="compiler-types" />
export default class MobileJoystick extends AirshipBehaviour {
    handle: RectTransform;
    handleRange: number;
    deadZone: number;
    tweenToCenterSensitivity: number;
    private input;
    private dragging;
    private rectTransform;
    private canvas;
    private bin;
    private tweenBin;
    Awake(): void;
    Start(): void;
    private HandleDrag;
    private ApplyDeadZoneToInput;
    OnDestroy(): void;
}
