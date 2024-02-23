/// <reference types="@easy-games/compiler-types" />
import { InputAction } from "../../../Input/InputAction";
export default class SettingsKeybind extends AirshipBehaviour {
    title: TMP_Text;
    valueWrapper: GameObject;
    valueText: TMP_Text;
    valueImageBG: Image;
    overlay: GameObject;
    private inputAction;
    private isListening;
    private bin;
    OnEnable(): void;
    private OpenRightClick;
    ResetToDefault(): void;
    /**
     *
     * @param newKeybind
     */
    private UpdateKeybind;
    /**
     *
     */
    private UnsetKeybind;
    /**
     *
     * @param action
     */
    Init(action: InputAction): void;
    Update(_dt: number): void;
    /**
     *
     * @param text
     */
    private UpdateKeybindText;
    /**
     *
     * @param keyCode
     */
    private UpdateKeybindTextFromKeyCode;
    private SetListening;
    OnDisable(): void;
}
