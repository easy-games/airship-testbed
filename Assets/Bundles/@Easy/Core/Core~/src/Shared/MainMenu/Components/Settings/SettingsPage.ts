import MainMenuPageComponent from "@Easy/Core/Client/MainMenuControllers/MainMenuPageComponent";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { MainMenuSingleton } from "../../Singletons/MainMenuSingleton";

export default class SettingsPage extends MainMenuPageComponent {
	public sidebar!: RectTransform;
	public tabs!: RectTransform;

	// public mobilePages!: RectTransform[];

	private bin = new Bin();

	public OnEnable(): void {
		const rect = this.gameObject.transform as RectTransform;
		const mainMenu = Dependency<MainMenuSingleton>();
		this.bin.Add(
			mainMenu.ObserveScreenSize((size) => {
				if (size === "sm") {
					this.sidebar.gameObject.SetActive(false);
					this.tabs.offsetMax = new Vector2(-10, -7);
					this.tabs.offsetMin = new Vector2(10, 0);
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
						this.tabs.GetChild(3).gameObject.SetActive(true); // Blocked
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
