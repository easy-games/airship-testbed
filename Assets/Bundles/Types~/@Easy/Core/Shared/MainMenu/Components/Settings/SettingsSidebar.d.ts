/// <reference types="@easy-games/compiler-types" />
import SettingsTabButton from "./SettingsTabButton";
export default class SettingsSidebar extends AirshipBehaviour {
    gameHomeTab: GameObject;
    tabs: RectTransform;
    private tabBtns;
    OnEnable(): void;
    OnDisable(): void;
    SetSelectedTab(tab: SettingsTabButton): void;
}
