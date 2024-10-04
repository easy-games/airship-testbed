import { Dependency } from "../../../Flamework";
import { Game } from "../../../Game";
import { Bin } from "../../../Util/Bin";
import { MainMenuSingleton } from "../../Singletons/MainMenuSingleton";

export default class Navbar extends AirshipBehaviour {
	@Header("References")
	public leftContent!: RectTransform;
	public rightContent!: RectTransform;
	public rightLayoutGroup!: HorizontalLayoutGroup;
	public runningGameBtn!: RectTransform;
	public myGamesBtn!: RectTransform;
	public homeBtn!: RectTransform;
	public avatarBtn!: RectTransform;
	public scrollRect!: ScrollRect;
	public creditsWrapper!: GameObject;
	public left!: RectTransform;
	public quitGameBtn!: RectTransform;
	public searchWrapper: RectTransform;
	public accountWrapper: RectTransform;

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

				if (Game.IsLandscape() && Game.IsMobile() && Game.IsInGame()) {
					this.avatarBtn.gameObject.SetActive(false);
					rect.offsetMin = new Vector2(50, rect.offsetMin.y);
					this.rightLayoutGroup.padding.right = 55;
					Bridge.UpdateLayout(this.rightLayoutGroup.transform, false);
					this.left.offsetMax = new Vector2(-276, this.left.offsetMax.y);
				} else {
					rect.offsetMin = new Vector2(15, rect.offsetMin.y);
					rect.offsetMax = new Vector2(-15, rect.offsetMax.y);
					this.rightLayoutGroup.padding.right = 0;
				}

				if (Game.IsInGame() && st === "sm") {
					this.myGamesBtn.gameObject.SetActive(false);
					this.searchWrapper.gameObject.SetActive(false);
					this.homeBtn.gameObject.SetActive(false);
					this.runningGameBtn.gameObject.SetActive(false);
				} else {
					this.myGamesBtn.gameObject.SetActive(true);
				}
			}),
		);
		Bridge.UpdateLayout(this.accountWrapper, true);

		// this.quitGameBtn.gameObject.SetActive(Screen.fullScreen);
		this.quitGameBtn.gameObject.SetActive(false);

		if (Game.deviceType !== AirshipDeviceType.Phone || Game.IsPortrait()) {
			this.scrollRect.enabled = false;
		}

		if (Game.IsMobile()) {
			this.creditsWrapper.SetActive(false);
		}
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
