/// <reference types="@easy-games/compiler-types" />
export default class SettingsKeybindPage extends AirshipBehaviour {
    keybindPrefab: GameObject;
    list: Transform;
    resetToDefaultBtn: GameObject;
    private bin;
    OnEnable(): void;
    AddKeybind(name: string, currentKeyCode: KeyCode | undefined, defaultKeyCode: KeyCode): void;
    OnDisable(): void;
}
