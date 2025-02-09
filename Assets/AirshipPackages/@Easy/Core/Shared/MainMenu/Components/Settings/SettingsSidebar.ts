import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import SettingsTabButton from "./SettingsTabButton";

export default class SettingsSidebar extends AirshipBehaviour {
	public tabs!: RectTransform;

	private hasGameTab = false;

	@NonSerialized() public tabBtns: SettingsTabButton[] = [];

	protected Awake(): void {
		print("SettingsSidebar.awake");
		let childCount = this.gameObject.transform.childCount;
		for (let i = 0; i < childCount; i++) {
			const tab = this.gameObject.transform.GetChild(i).gameObject.GetAirshipComponent<SettingsTabButton>()!;
			this.tabBtns.push(tab);
		}
	}

	public OnEnable(): void {
		this.SetupGameTab();
	}

	private SetupGameTab(): void {
		const gameTabBtn = this.tabBtns[0];
		if (Protected.settings.gameSettings.size() === 0) {
			// no custom game settings, so we disable the tab.
			this.hasGameTab = false;
			gameTabBtn.gameObject.SetActive(false);
			return;
		}
		this.hasGameTab = true;
		gameTabBtn.gameObject.SetActive(true);
		if (Game.gameData) {
			gameTabBtn.text.text = Game.gameData.name;
		}
	}

	public OnDestroy(): void {
		this.tabBtns.clear();
	}

	public SetSelectedTab(tab: SettingsTabButton): void {
		if (!tab.gameObject.activeInHierarchy) {
			tab = this.tabBtns[2]; // default to input tab
		}
		for (let other of this.tabBtns) {
			if (other.tab === undefined) continue;
			if (other.gameObject === tab.gameObject) {
				other.SetSelected(true);
				other.tab.SetActive(true);

				// const rect = other.tab.GetComponent<RectTransform>()!;
				// rect.anchoredPosition = new Vector2(0, -10);
				// rect.TweenAnchoredPosition(new Vector2(0, 0), 0.1);
			} else {
				other.SetSelected(false);
				other.tab.SetActive(false);
			}
		}
		Bridge.UpdateLayout(this.tabs, true);
	}
}
