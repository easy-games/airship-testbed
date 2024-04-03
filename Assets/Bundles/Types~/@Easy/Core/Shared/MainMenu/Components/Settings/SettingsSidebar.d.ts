/// <reference types="compiler-types" />
import SettingsTabButton from "./SettingsTabButton";
export default class SettingsSidebar extends AirshipBehaviour {
    tabs: RectTransform;
    private tabBtns;
    OnEnable(): void;
    OnDisable(): void;
    SetSelectedTab(tab: SettingsTabButton): void;
}
