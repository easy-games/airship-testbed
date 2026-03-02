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
	private defaultRectOffsetMin?: Vector2;
	private defaultRectOffsetMax?: Vector2;
	private defaultLeftOffsetMax?: Vector2;

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
		this.defaultRectOffsetMin = rect.offsetMin;
		this.defaultRectOffsetMax = rect.offsetMax;
		this.defaultLeftOffsetMax = this.left.offsetMax;

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
					rect.offsetMin = new Vector2(50, this.defaultRectOffsetMin!.y);
					rect.offsetMax = this.defaultRectOffsetMax!;
					this.left.offsetMax = new Vector2(-276, this.defaultLeftOffsetMax!.y);
				} else {
					this.avatarBtn.gameObject.SetActive(true);
					rect.offsetMin = new Vector2(15, this.defaultRectOffsetMin!.y);
					rect.offsetMax = new Vector2(-15, this.defaultRectOffsetMax!.y);
					this.left.offsetMax = this.defaultLeftOffsetMax!;
				}

				if (Game.IsPortrait()) {
					this.avatarBtn.gameObject.SetActive(false);
				}

				const useSmallSearch = Game.IsPortrait();
				const hideNavButtons = Game.IsInGame() && st === "sm";
				this.searchWrapper.gameObject.SetActive(!hideNavButtons && !useSmallSearch);
				this.homeBtn.gameObject.SetActive(!hideNavButtons && !Game.IsPortrait());
				this.runningGameBtn.gameObject.SetActive(Game.IsInGame() && !hideNavButtons);
				this.smallSearchBtn.gameObject.SetActive(useSmallSearch);
				this.account.SetActive(useSmallSearch);
				this.myGamesBtn.gameObject.SetActive(!Game.IsMobile());
			}),
		);

		this.bin.Add(
			this.smallSearchBtn.onClick.Connect(() => {
				Dependency<MainMenuNavbarController>().FocusSearchbar();
			}),
		);

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
