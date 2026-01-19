import { MainMenuController } from "@Easy/Core/Client/ProtectedControllers/MainMenuController";
import { MainMenuNavbarController } from "@Easy/Core/Client/ProtectedControllers/MainMenuNavbarController";
import { MainMenuPageType } from "@Easy/Core/Client/ProtectedControllers/MainMenuPageName";
import { Dependency } from "../../../Flamework";
import { Game } from "../../../Game";
import { Bin } from "../../../Util/Bin";
import { MainMenuSingleton } from "../../Singletons/MainMenuSingleton";

export default class Navbar extends AirshipBehaviour {
	@Header("References")
	public leftContent!: RectTransform;
	public runningGameBtn!: RectTransform;
	public myGamesBtn!: RectTransform;
	public homeBtn!: RectTransform;
	public avatarBtn!: RectTransform;
	public creditsWrapper!: GameObject;
	public left!: RectTransform;
	public quitGameBtn!: RectTransform;
	public searchWrapper: RectTransform;
	public smallSearchBtn: Button;
	public logoBtn: RectTransform;
	public account: GameObject;
	public bg: GameObject;

	private bin = new Bin();

	override OnEnable(): void {
		if (Dependency<MainMenuSingleton>().IsInGameNonTabletMobile()) {
			this.gameObject.SetActive(false);
			return;
		}

		if (Game.IsMobile()) {
			this.myGamesBtn.gameObject.SetActive(false);
		} else {
			this.myGamesBtn.gameObject.SetActive(true);
		}

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
					this.left.offsetMax = new Vector2(-276, this.left.offsetMax.y);
				} else {
					rect.offsetMin = new Vector2(15, rect.offsetMin.y);
					rect.offsetMax = new Vector2(-15, rect.offsetMax.y);

					if (Game.IsInGame() && st === "sm") {
						this.searchWrapper.gameObject.SetActive(false);
						this.homeBtn.gameObject.SetActive(false);
						this.runningGameBtn.gameObject.SetActive(false);
					} else {
					}
				}
			}),
		);

		if (Game.IsPortrait()) {
			// this.logoBtn.gameObject.SetActive(false);
			this.searchWrapper.gameObject.SetActive(false);
			this.smallSearchBtn.gameObject.SetActive(true);
			this.bin.Add(
				this.smallSearchBtn.onClick.Connect(() => {
					Dependency<MainMenuNavbarController>().FocusSearchbar();
				}),
			);
			this.account.SetActive(true);
			this.myGamesBtn.gameObject.SetActive(false);
		} else {
			this.smallSearchBtn.gameObject.SetActive(false);
			this.account.SetActive(false);
		}

		// this.quitGameBtn.gameObject.SetActive(Screen.fullScreen);
		this.quitGameBtn.gameObject.SetActive(false);

		// if (Game.IsMobile()) {
		// 	this.creditsWrapper.SetActive(false);
		// }
	}

	protected Start(): void {
		const HandlePage = (page: MainMenuPageType) => {
			if (page === MainMenuPageType.Game) {
				this.bg.SetActive(false);
			} else {
				this.bg.SetActive(true);
			}
		};
		const mainMenuController = Dependency<MainMenuController>();
		mainMenuController.onPageChange.Connect((e) => {
			HandlePage(e.newPage);
		});
		if (mainMenuController.currentPage) {
			HandlePage(mainMenuController.currentPage.pageType);
		}
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
