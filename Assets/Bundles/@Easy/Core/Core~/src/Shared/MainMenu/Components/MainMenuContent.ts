import { CoreContext } from "../../CoreClientContext";
import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { CoreLogger } from "../../Logger/CoreLogger";
import { Bin } from "../../Util/Bin";
import { MainMenuSingleton } from "../Singletons/MainMenuSingleton";
import { ScreenSizeType } from "../Singletons/ScreenSizeType";

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
		this.CalcLayout();

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
	}

	public Update(dt: number): void {
		if (this.canvasRect.sizeDelta !== this.mainMenu.screenSize) {
			this.mainMenu.screenSize = this.canvasRect.sizeDelta;
			this.CalcLayout();
			this.mainMenu.onSizeChanged.Fire(this.mainMenu.sizeType, this.mainMenu.screenSize);
		}
	}

	public CalcLayout(): void {
		const screenSize = this.mainMenu.screenSize;

		if (Game.IsMobile()) {
			this.canvasScalar.scaleFactor = Screen.dpi / 180;
		} else if (Screen.dpi >= 255) {
			this.canvasScalar.scaleFactor = 1.75;
		} else {
			this.canvasScalar.scaleFactor = 1;
		}
		const scaleFactor = this.canvasScalar.scaleFactor;

		let sizeType: ScreenSizeType = "md";
		if (Game.IsPortrait()) {
			if (screenSize.x < 500) {
				sizeType = "sm";
			}
		} else {
			if (screenSize.x <= 1200) {
				sizeType = "sm";
			} else if (screenSize.x >= 1760) {
				sizeType = "lg";
			}
		}
		this.mainMenu.sizeType = sizeType;

		if (Game.coreContext === CoreContext.MAIN_MENU) {
			if (Game.deviceType === AirshipDeviceType.Phone) {
				// phones are in portrait
				Screen.orientation = ScreenOrientation.Portrait;
			} else {
				// ipads are in landscape
				Screen.orientation = ScreenOrientation.LandscapeLeft;
			}
		}

		CoreLogger.Log(
			`screenSize.x: ${screenSize.x}, sizetype: ${sizeType}, scaleFactor: ${this.canvasScalar.scaleFactor}, portrait: ${Game.IsPortrait()}`,
		);
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

			this.searchFocused.offsetMin = new Vector2(15, 0);
			this.searchFocused.offsetMax = new Vector2(-15, -Game.GetNotchHeight() - 15);
			this.mobileNav.gameObject.SetActive(true);
		} else {
			// Landscape
			this.socialMenu.gameObject.SetActive(true);
			this.socialMenu.anchorMin = new Vector2(0, 1);
			this.socialMenu.anchorMax = new Vector2(0, 1);
			this.socialMenu.pivot = new Vector2(0, 1);
			this.socialMenu.sizeDelta = new Vector2(301, screenSize.y - 50);
			this.socialMenu.SetParent(this.gameObject.transform);

			let socialMenuHidden = Dependency<MainMenuSingleton>()
				.socialMenuModifier.GetTickets()
				.some((v) => v.hidden);

			if (sizeType === "lg") {
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
				this.contentWrapper.anchoredPosition = new Vector2(25, -67);
				this.contentWrapper.sizeDelta = new Vector2(
					screenSize.x + (socialMenuHidden ? -100 : -400),
					screenSize.y - 67,
				);

				this.navbarContentWrapper.sizeDelta = new Vector2(
					this.contentWrapper.sizeDelta.x + (socialMenuHidden ? 41 : 341),
					this.navbarContentWrapper.sizeDelta.y,
				);
				this.navbarContentWrapper.anchorMin = new Vector2(0, 1);
				this.navbarContentWrapper.anchorMax = new Vector2(0, 1);
				this.navbarContentWrapper.pivot = new Vector2(0, 1);
				this.navbarContentWrapper.anchoredPosition = new Vector2(25, 0);
			}
			this.navbar.anchoredPosition = new Vector2(0, 0);

			if (sizeType === "lg") {
				this.socialMenu.anchorMin = new Vector2(0, 1);
				this.socialMenu.anchorMax = new Vector2(0, 1);
				this.socialMenu.pivot = new Vector2(0, 1);
				let socialMenuPos = this.contentWrapper.anchoredPosition.add(new Vector2(40, -43));
				socialMenuPos = socialMenuPos
					.add(new Vector2(this.canvasRect.sizeDelta.x / 2, 0))
					.add(new Vector2(this.contentWrapper.sizeDelta.x / 2, 0));
				this.socialMenu.anchoredPosition = socialMenuPos;
			} else {
				this.socialMenu.anchorMin = new Vector2(1, 1);
				this.socialMenu.anchorMax = new Vector2(1, 1);
				this.socialMenu.pivot = new Vector2(1, 1);
				this.socialMenu.anchoredPosition = new Vector2(
					-30,
					this.contentWrapper.anchoredPosition.y +
						(Game.deviceType === AirshipDeviceType.Phone ? -53 : 0) -
						43,
				);
			}
			this.socialMenu.gameObject.SetActive(!socialMenuHidden);

			this.navbar.sizeDelta = new Vector2(this.navbar.sizeDelta.x, 67);
			this.pages.offsetMax = new Vector2(0, 0);
			this.navbar.offsetMin = new Vector2(0, this.navbar.offsetMin.y);
			this.navbar.offsetMax = new Vector2(0, this.navbar.offsetMax.y);

			this.searchFocused.offsetMin = this.navbarContentWrapper.offsetMin;
			this.searchFocused.offsetMax = this.navbarContentWrapper.offsetMax;
			this.searchFocused.anchorMax = this.navbarContentWrapper.anchorMax;
			this.searchFocused.anchorMin = this.navbarContentWrapper.anchorMin;
			this.searchFocused.pivot = this.navbarContentWrapper.pivot;
			this.searchFocused.anchoredPosition = this.navbarContentWrapper.anchoredPosition.add(new Vector2(0, -15));

			this.mobileNav.gameObject.SetActive(false);
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
