import { CoreContext } from "../../CoreClientContext";
import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { Bin } from "../../Util/Bin";
import { MainMenuSingleton } from "../Singletons/MainMenuSingleton";

export default class MainMenuContent extends AirshipBehaviour {
	public canvasRect!: RectTransform;
	public canvasScalar!: CanvasScaler;
	public mobileOverlayCanvasScalar?: CanvasScaler;
	public contentWrapper!: RectTransform;
	public socialMenu!: RectTransform;
	public friendsPage!: RectTransform;
	public pages!: RectTransform;
	public searchFocused!: RectTransform;
	public mobileNav!: RectTransform;

	@Header("Navbar")
	public navbar!: RectTransform;
	public navbarContentWrapper!: RectTransform;
	public navbarTabs!: RectTransform[];
	public navbarLeft!: RectTransform;
	public navbarRight!: RectTransform;

	private mainMenu!: MainMenuSingleton;

	private bin = new Bin();

	override Start(): void {
		this.mainMenu = Dependency<MainMenuSingleton>();

		this.bin.Add(
			this.mainMenu.navbarModifier.Observe((tickets) => {
				let shouldBeHidden = tickets.some((v) => v.hidden);
				this.navbar.gameObject.SetActive(!shouldBeHidden);
			}),
		);

		let firstSocialChange = true;
		this.bin.Add(
			this.mainMenu.socialMenuModifier.Observe((tickets) => {
				if (firstSocialChange) {
					firstSocialChange = false;
					return;
				}
				this.CalcLayout();
			}),
		);

		this.bin.Add(
			this.mainMenu.ObserveScreenSize((st, size) => {
				this.CalcLayout();
			}),
		);
	}

	public CalcLayout(): void {
		const screenSize = this.mainMenu.screenSize;

		const scaleFactor = Game.GetScaleFactor();
		this.canvasScalar.scaleFactor = scaleFactor;

		if (Game.coreContext === CoreContext.MAIN_MENU) {
			if (Game.deviceType === AirshipDeviceType.Phone) {
				// phones are in portrait
				Screen.orientation = ScreenOrientation.Portrait;
			} else {
				// ipads are in landscape
				Screen.orientation = ScreenOrientation.LandscapeLeft;
			}
		}

		// CoreLogger.Log(
		// 	`screenSize.x: ${screenSize.x}, sizetype: ${this.mainMenu.sizeType}, scaleFactor: ${
		// 		this.canvasScalar.scaleFactor
		// 	}, portrait: ${Game.IsPortrait()}`,
		// );
		// CoreLogger.Log("dpi: " + Screen.dpi);
		// CoreLogger.Log("resolution: " + Screen.currentResolution.width + ", " + Screen.currentResolution.height);

		if (Game.IsPortrait()) {
			this.canvasScalar.matchWidthOrHeight = 1;
			this.socialMenu.SetParent(this.friendsPage);
			this.socialMenu.anchorMin = new Vector2(0, 0);
			this.socialMenu.anchorMax = new Vector2(1, 1);
			this.socialMenu.pivot = new Vector2(0.5, 1);
			this.socialMenu.offsetMin = new Vector2(0, 0);
			this.socialMenu.offsetMax = new Vector2(0, 0);
			this.socialMenu.gameObject.SetActive(true);

			this.contentWrapper.sizeDelta = new Vector2(screenSize.x * 0.98, screenSize.y);
			this.contentWrapper.anchorMin = new Vector2(0.5, 1);
			this.contentWrapper.anchorMax = new Vector2(0.5, 1);
			this.contentWrapper.pivot = new Vector2(0.5, 1);
			this.contentWrapper.anchoredPosition = new Vector2(0, -Game.GetNotchHeight());

			this.navbar.sizeDelta = new Vector2(this.navbar.sizeDelta.x, 67);
			this.pages.offsetMax = new Vector2(0, -69);
			this.navbar.anchoredPosition = new Vector2(0, -Game.GetNotchHeight());
			for (let tab of this.navbarTabs) {
				tab.gameObject.SetActive(false);
			}

			this.navbarContentWrapper.anchorMin = new Vector2(0, 1);
			this.navbarContentWrapper.anchorMax = new Vector2(1, 1);
			this.navbarContentWrapper.pivot = new Vector2(0.5, 1);
			this.navbarContentWrapper.offsetMax = new Vector2(0, 65);
			this.navbarContentWrapper.offsetMin = new Vector2(0, 0);
			this.navbarContentWrapper.anchoredPosition = new Vector2(0, 0);
			this.navbarRight.offsetMin = new Vector2(-250, this.navbarRight.offsetMin.y);

			this.mobileNav.gameObject.SetActive(true);
			this.pages.offsetMin = new Vector2(0, this.pages.offsetMin.y);
		} else {
			// Landscape
			this.socialMenu.gameObject.SetActive(true);
			this.socialMenu.anchorMin = new Vector2(0, 1);
			this.socialMenu.anchorMax = new Vector2(0, 1);
			this.socialMenu.pivot = new Vector2(0, 1);
			this.socialMenu.sizeDelta = new Vector2(301, screenSize.y - 110);
			this.socialMenu.SetParent(this.gameObject.transform);

			let socialMenuHidden = Dependency<MainMenuSingleton>()
				.socialMenuModifier.GetTickets()
				.some((v) => v.hidden);

			if (this.mainMenu.sizeType === "lg") {
				this.contentWrapper.anchorMin = new Vector2(0.5, 1);
				this.contentWrapper.anchorMax = new Vector2(0.5, 1);
				this.contentWrapper.pivot = new Vector2(0.5, 1);
				this.contentWrapper.anchoredPosition = new Vector2(socialMenuHidden ? 0 : -150, -67);
				this.contentWrapper.sizeDelta = new Vector2(
					math.min(screenSize.x - 400, 1050) + (socialMenuHidden ? 300 : 0),
					screenSize.y - 67,
				);

				this.navbarContentWrapper.sizeDelta = new Vector2(
					math.min(screenSize.x - 400, 1050) + 40 + 301,
					this.navbarContentWrapper.sizeDelta.y,
				);
				this.navbarContentWrapper.anchorMin = new Vector2(0.5, 1);
				this.navbarContentWrapper.anchorMax = new Vector2(0.5, 1);
				this.navbarContentWrapper.pivot = new Vector2(0.5, 1);
				this.navbarContentWrapper.anchoredPosition = new Vector2(20, 0);
			} else {
				this.contentWrapper.anchorMin = new Vector2(0, 1);
				this.contentWrapper.anchorMax = new Vector2(0, 1);
				this.contentWrapper.pivot = new Vector2(0, 1);
				this.contentWrapper.anchoredPosition = new Vector2(Game.GetNotchHeight(), -67);
				this.contentWrapper.sizeDelta = new Vector2(
					screenSize.x + (socialMenuHidden ? -100 : -360) - Game.GetNotchHeight(),
					screenSize.y - 67,
				);

				this.navbarContentWrapper.sizeDelta = new Vector2(
					this.contentWrapper.sizeDelta.x + (socialMenuHidden ? 81 : 341) - 110,
					this.navbarContentWrapper.sizeDelta.y,
				);
				this.navbarContentWrapper.anchorMin = new Vector2(0, 1);
				this.navbarContentWrapper.anchorMax = new Vector2(0, 1);
				this.navbarContentWrapper.pivot = new Vector2(0, 1);
				this.navbarContentWrapper.anchoredPosition = new Vector2(102, 0);
			}
			// this.navbar.anchoredPosition = new Vector2(0, 0);

			if (this.mainMenu.sizeType === "lg") {
				this.socialMenu.anchorMin = new Vector2(0, 1);
				this.socialMenu.anchorMax = new Vector2(0, 1);
				this.socialMenu.pivot = new Vector2(0, 1);
				let socialMenuPos = this.contentWrapper.anchoredPosition.add(new Vector2(40, -43));
				// print(
				// 	"canvasRect.sizeDelta.x: " +
				// 		this.canvasRect.sizeDelta.x +
				// 		", contentWrapper.sizeDelta.x: " +
				// 		this.contentWrapper.sizeDelta.x,
				// );
				socialMenuPos = socialMenuPos
					.add(new Vector2(screenSize.x / 2, 0))
					// .add(new Vector2(screenSize.x / 2, 0))
					.add(new Vector2(this.contentWrapper.sizeDelta.x / 2, 0));
				this.socialMenu.anchoredPosition = socialMenuPos;
			} else {
				this.socialMenu.anchorMin = new Vector2(1, 1);
				this.socialMenu.anchorMax = new Vector2(1, 1);
				this.socialMenu.pivot = new Vector2(1, 1);
				this.socialMenu.anchoredPosition = new Vector2(
					-30,
					this.contentWrapper.anchoredPosition.y + (Game.deviceType === AirshipDeviceType.Phone ? -8 : -43),
				);
			}
			this.socialMenu.gameObject.SetActive(!socialMenuHidden);

			// this.navbar.sizeDelta = new Vector2(this.navbar.sizeDelta.x, 67);
			this.pages.offsetMax = new Vector2(0, 0);
			if (Game.IsLandscape() && this.mainMenu.sizeType === "sm") {
				this.pages.offsetMin = new Vector2(Game.GetNotchHeight(), this.pages.offsetMin.y);
			} else {
				this.pages.offsetMin = new Vector2(0, this.pages.offsetMin.y);
			}
			// this.navbar.offsetMin = new Vector2(0, this.navbar.offsetMin.y);
			// this.navbar.offsetMax = new Vector2(0, this.navbar.offsetMax.y);

			this.mobileNav.gameObject.SetActive(false);
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
