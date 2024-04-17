/// <reference types="compiler-types" />
import { InputAction } from "../../../Input/InputAction";
export default class SettingsKeybind extends AirshipBehaviour {
    title: TMP_Text;
    valueWrapper: GameObject;
    valueText: TMP_Text;
    valueImageBG: Image;
    overlay: GameObject;
    private inputDevice;
    private inputAction;
    private isListening;
    private downPrimaryKeyCode;
    private downModifierKey;
    private bin;
    OnEnable(): void;
    private OpenRightClick;
    ResetToDefault(): void;
    /**
     *
     * @param newBinding
     */
    private UpdateBinding;
    /**
     *
     */
    private UnsetBinding;
    /**
     *
     * @param action
     */
    Init(action: InputAction): void;
    /**
     *
     */
    private HighlightValueImage;
    private StartKeyListener;
    Update(dt: number): void;
    /**
     *
     * @param text
     */
    private UpdateKeybindText;
    /**
     *
     * @param keyCode
     */
    private UpdateBindingTextFromBinding;
    private SetListening;
    OnDisable(): void;
}
