import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Game } from "@Easy/Core/Shared/Game";
import SettingsTabButton from "./SettingsTabButton";

export default class SettingsSidebar extends AirshipBehaviour {
	public gameHomeTab!: GameObject;

	private tabBtns: SettingsTabButton[] = [];

	public OnEnable(): void {
		let childCount = this.gameObject.transform.childCount;
		for (let i = 0; i < childCount; i++) {
			const tab = this.gameObject.transform.GetChild(i).gameObject.GetAirshipComponent<SettingsTabButton>()!;
			this.tabBtns.push(tab);
		}

		if (Game.context === CoreContext.GAME) {
			this.SetSelectedTab(this.tabBtns[0]);
		} else {
			this.gameHomeTab.SetActive(false);
			this.SetSelectedTab(this.tabBtns[1]);
		}
	}

	public OnDisable(): void {
		this.tabBtns.clear();
	}

	public SetSelectedTab(tab: SettingsTabButton): void {
		for (let other of this.tabBtns) {
			if (other.gameObject === tab.gameObject) {
				other.SetSelected(true);
				other.tab.SetActive(true);

				const rect = other.tab.GetComponent<RectTransform>();
				rect.anchoredPosition = new Vector2(0, -10);
				rect.TweenAnchoredPosition(new Vector2(0, 0), 0.1);
			} else {
				other.SetSelected(false);
				other.tab.SetActive(false);
			}
		}
	}
}
