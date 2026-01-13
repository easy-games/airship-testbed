import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { MainMenuSingleton } from "../../Singletons/MainMenuSingleton";
import MainMenuPageComponent from "../MainMenuPageComponent";

export default class FriendsPage extends MainMenuPageComponent {
	private bin = new Bin();

	override OnEnable(): void {
		const rect = this.transform as RectTransform;
		const mainMenu = Dependency<MainMenuSingleton>();
		this.bin.Add(
			mainMenu.ObserveScreenSize((size) => {
				// if (Game.IsPortrait()) {
				// 	rect.offsetMax = new Vector2(rect.offsetMax.x, -20);
				// 	rect.offsetMin = new Vector2(rect.offsetMin.x, 0);
				// } else {
				// 	rect.offsetMax = new Vector2(rect.offsetMax.x, 0);
				// 	rect.offsetMin = new Vector2(rect.offsetMin.x, 0);
				// }
			}),
		);

		if (Game.IsPortrait()) {
			this.bin.Add(Dependency<MainMenuSingleton>().navbarModifier.Add({ hidden: true }));
		}
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
