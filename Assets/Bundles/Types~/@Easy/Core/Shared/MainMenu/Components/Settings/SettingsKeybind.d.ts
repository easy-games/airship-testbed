/// <reference types="@easy-games/compiler-types" />
export default class SettingsKeybind extends AirshipBehaviour {
    title: TMP_Text;
    valueWrapper: GameObject;
    valueText: TMP_Text;
    valueImageBG: Image;
    overlay: GameObject;
    keyCode: KeyCode | undefined;
    private isListening;
    private bin;
    OnEnable(): void;
    Update(dt: number): void;
    private SetKeyCode;
    private SetListening;
    OnDisable(): void;
}
