import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { MainMenuSingleton } from "../../Singletons/MainMenuSingleton";

export default class SettingsPage extends AirshipBehaviour {
	public sidebar!: RectTransform;
	public tabs!: RectTransform;

	public mobilePages!: RectTransform[];

	private bin = new Bin();

	public OnEnable(): void {
		const mainMenu = Dependency<MainMenuSingleton>();
		this.bin.Add(
			mainMenu.ObserveScreenSizeType((size) => {
				if (size === "sm") {
					print("sm tabs");
					this.sidebar.gameObject.SetActive(false);
					this.tabs.offsetMax = new Vector2(-10, this.tabs.offsetMax.y);
					this.tabs.offsetMin = new Vector2(10, 0);

					for (let page of this.mobilePages) {
						page.gameObject.SetActive(true);
					}
				} else {
					this.sidebar.gameObject.SetActive(true);
					this.tabs.offsetMax = new Vector2(-41, -49);
					this.tabs.offsetMin = new Vector2(270, -mainMenu.screenSize.y);
				}
			}),
		);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
