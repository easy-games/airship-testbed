/// <reference types="@easy-games/compiler-types" />
import { InputAction } from "../../../Input/InputAction";
export default class SettingsKeybindPage extends AirshipBehaviour {
    keybindPrefab: GameObject;
    list: Transform;
    resetToDefaultBtn: GameObject;
    private bin;
    OnEnable(): void;
    AddKeybind(action: InputAction): void;
    OnDisable(): void;
}
