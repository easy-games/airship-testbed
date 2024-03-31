import { CoreContext } from "../../CoreClientContext";
import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { Bin } from "../../Util/Bin";
import { MainMenuSingleton } from "../Singletons/MainMenuSingleton";

export default class Navbar extends AirshipBehaviour {
	@Header("References")
	public leftContent!: RectTransform;
	public rightContent!: RectTransform;
	public rightLayoutGroup!: HorizontalLayoutGroup;
	public runningGameBtn!: RectTransform;
	public myGamesBtn!: RectTransform;
	public homeBtn!: RectTransform;

	private bin = new Bin();

	override OnEnable(): void {
		const rect = this.transform as RectTransform;
		const mainMenu = Dependency<MainMenuSingleton>();
		this.bin.Add(
			mainMenu.ObserveScreenSize((st, size) => {
				// if (st === "sm") {
				// 	this.runningGameBtn.SetParent(this.leftContent);
				// } else {
				// 	this.runningGameBtn.SetParent(this.rightContent);
				// 	this.runningGameBtn.SetSiblingIndex(0);
				// }

				if (Game.IsLandscape() && st === "sm" && Game.coreContext === CoreContext.GAME) {
					rect.offsetMin = new Vector2(46, rect.offsetMin.y);
					this.rightLayoutGroup.padding.right = 55;
					Bridge.UpdateLayout(this.rightLayoutGroup.transform, false);
				} else {
					rect.offsetMin = new Vector2(0, rect.offsetMin.y);
					this.rightLayoutGroup.padding.right = 0;
				}

				if (Game.coreContext === CoreContext.GAME && st === "sm") {
					this.homeBtn.gameObject.SetActive(false);
					this.myGamesBtn.gameObject.SetActive(false);
				}
			}),
		);
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
