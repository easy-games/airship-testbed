/// <reference types="@easy-games/compiler-types" />
export default class SettingsTabButton extends AirshipBehaviour {
    tab: GameObject;
    bgImage: Image;
    text: TMP_Text;
    iconImage: Image;
    private bin;
    private sidebar;
    private selected;
    OnEnable(): void;
    OnDisable(): void;
    SetSelected(val: boolean): void;
}
