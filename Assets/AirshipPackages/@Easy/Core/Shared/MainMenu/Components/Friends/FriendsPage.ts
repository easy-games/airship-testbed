import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { MainMenuSingleton } from "../../Singletons/MainMenuSingleton";

export default class FriendsPage extends AirshipBehaviour {
	private bin = new Bin();

	override OnEnable(): void {
		const rect = this.gameObject.transform as RectTransform;
		const mainMenu = Dependency<MainMenuSingleton>();
		this.bin.Add(
			mainMenu.ObserveScreenSize((size) => {
				if (size === "sm") {
					rect.offsetMax = new Vector2(rect.offsetMax.x, -80);
					rect.offsetMin = new Vector2(rect.offsetMin.x, 0);
				} else {
					rect.offsetMax = new Vector2(rect.offsetMax.x, 0);
					rect.offsetMin = new Vector2(rect.offsetMin.x, 0);
				}
				rect.anchoredPosition = new Vector2(0, 0);
			}),
		);
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
