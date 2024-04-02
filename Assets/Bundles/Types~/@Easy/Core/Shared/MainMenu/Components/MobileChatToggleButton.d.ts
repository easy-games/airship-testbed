/// <reference types="compiler-types" />
export default class MobileChatToggleButton extends AirshipBehaviour {
    activeColor: Color;
    disabledColor: Color;
    bgImage: Image;
    button: Button;
    private active;
    private bin;
    OnEnable(): void;
    OnDisable(): void;
    private SetActiveVisuals;
}
