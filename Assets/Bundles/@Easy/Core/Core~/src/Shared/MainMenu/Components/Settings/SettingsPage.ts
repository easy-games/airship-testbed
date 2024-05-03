import MainMenuPageComponent from "@Easy/Core/Client/MainMenuControllers/MainMenuPageComponent";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { MainMenuSingleton } from "../../Singletons/MainMenuSingleton";

export default class SettingsPage extends MainMenuPageComponent {
	public sidebar!: RectTransform;
	public tabs!: RectTransform;
	public scrollView!: RectTransform;

	// public mobilePages!: RectTransform[];

	private bin = new Bin();

	public OnEnable(): void {
		const rect = this.gameObject.transform as RectTransform;
		const mainMenu = Dependency<MainMenuSingleton>();
		this.bin.Add(
			mainMenu.ObserveScreenSize((size) => {
				if (size === "sm") {
					this.sidebar.gameObject.SetActive(false);
					this.scrollView.offsetMax = new Vector2(-5, -7);
					this.scrollView.offsetMin = new Vector2(5, 0);
					// rect.offsetMax = new Vector2(rect.offsetMax.x, 40);
					// rect.offsetMin = new Vector2(rect.offsetMin.x, 0);

					// for (let page of this.mobilePages) {
					// 	page.gameObject.SetActive(true);
					// }

					// const navbarDisc = mainMenu.navbarModifier.Add({ hidden: true });
					// this.bin.Add(navbarDisc);
					// return () => {
					// 	navbarDisc();
					// };

					if (Game.deviceType === AirshipDeviceType.Phone) {
						this.tabs.GetChild(0).gameObject.SetActive(true); // Input
						this.tabs.GetChild(1).gameObject.SetActive(true); // Sound
						this.tabs.GetChild(4).gameObject.SetActive(true); // Blocked
						this.tabs.GetChild(5).gameObject.SetActive(true); // Developer
						this.tabs.GetChild(6).gameObject.SetActive(true); // Other
					}
				} else {
					// rect.offsetMax = new Vector2(rect.offsetMax.x, 0);
					// this.sidebar.gameObject.SetActive(true);
					// this.tabs.offsetMax = new Vector2(-41, -49);
					// this.tabs.offsetMin = new Vector2(270, -mainMenu.screenSize.y);
				}
			}),
		);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
