/// <reference types="@easy-games/compiler-types" />
export default class SettingsKeybind extends AirshipBehaviour {
    title: TMP_Text;
    valueWrapper: GameObject;
    valueText: TMP_Text;
    valueImageBG: Image;
    overlay: GameObject;
    keyCode: KeyCode | undefined;
    defaultKeyCode: KeyCode | undefined;
    private isListening;
    private bin;
    OnEnable(): void;
    private OpenRightClick;
    ResetToDefault(): void;
    Init(actionName: string, keyCode: KeyCode | undefined, defaultKeyCode: KeyCode | undefined): void;
    Update(dt: number): void;
    private SetKeyCode;
    private SetListening;
    OnDisable(): void;
}
