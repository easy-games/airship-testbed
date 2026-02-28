import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { Bin } from "../../Util/Bin";
import { ProtectedUtil } from "../../Util/ProtectedUtil";
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

	override Awake(): void {
		// Disable all pages to start.
		for (const child of this.pages) {
			child.gameObject.SetActive(false);
		}
	}

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

		// CoreLogger.Log(
		// 	`screenSize.x: ${screenSize.x}, sizetype: ${this.mainMenu.sizeType}, scaleFactor: ${
		// 		this.canvasScalar.scaleFactor
		// 	}, portrait: ${Game.IsPortrait()}`,
		// );
		// CoreLogger.Log("dpi: " + Screen.dpi);
		// CoreLogger.Log("resolution: " + Screen.currentResolution.width + ", " + Screen.currentResolution.height);

		const isNonTabletMobileInGame = Dependency<MainMenuSingleton>().IsInGameNonTabletMobile();

		const notchHeight = ProtectedUtil.GetNotchHeight();
		const navigationHeight = ProtectedUtil.GetNavigationHeight(); // some devices have a "soft navigation"

		if (Game.IsPortrait()) {
			// Portrait
			this.canvasScalar.matchWidthOrHeight = 1;
			this.socialMenu.SetParent(this.friendsPage);
			this.socialMenu.gameObject.SetActive(true);

			this.contentWrapper.sizeDelta = new Vector2(screenSize.x, screenSize.y - navigationHeight);
			this.contentWrapper.anchorMin = new Vector2(0.5, 1);
			this.contentWrapper.anchorMax = new Vector2(0.5, 1);
			this.contentWrapper.pivot = new Vector2(0.5, 1);
			this.contentWrapper.anchoredPosition = new Vector2(0, -notchHeight);

			this.navbar.sizeDelta = new Vector2(this.navbar.sizeDelta.x, 67);
			this.pages.offsetMax = new Vector2(0, -69);
			this.navbar.anchoredPosition = new Vector2(0, -notchHeight);
			for (let tab of this.navbarTabs) {
				tab.gameObject.SetActive(false);
			}

			this.navbarContentWrapper.anchorMin = new Vector2(0, 1);
			this.navbarContentWrapper.anchorMax = new Vector2(1, 1);
			this.navbarContentWrapper.pivot = new Vector2(0.5, 1);
			this.navbarContentWrapper.offsetMax = new Vector2(0, 65);
			this.navbarContentWrapper.offsetMin = new Vector2(0, 0);
			this.navbarContentWrapper.anchoredPosition = new Vector2(0, 0);

			this.mobileNav.gameObject.SetActive(true);
			this.pages.offsetMin = new Vector2(0, this.pages.offsetMin.y);
		} else {
			// Landscape
			let socialMenuHidden = Dependency<MainMenuSingleton>()
				.socialMenuModifier.GetTickets()
				.some((v) => v.hidden);

			if (Game.deviceType === AirshipDeviceType.Phone) {
				this.contentWrapper.anchorMin = new Vector2(0, 1);
				this.contentWrapper.anchorMax = new Vector2(0, 1);
				this.contentWrapper.pivot = new Vector2(0, 1);
				this.contentWrapper.anchoredPosition = new Vector2(Screen.safeArea.yMin, -67);
				this.contentWrapper.sizeDelta = new Vector2(screenSize.x - 360 - notchHeight, screenSize.y - 67);
			} else if (this.mainMenu.sizeType === "lg") {
				this.navbarContentWrapper.anchorMin = new Vector2(0.5, 1);
				this.navbarContentWrapper.anchorMax = new Vector2(0.5, 1);
				this.navbarContentWrapper.pivot = new Vector2(0.5, 1);
				this.navbarContentWrapper.anchoredPosition = new Vector2(20, 0);
			} else {
				this.contentWrapper.anchoredPosition = new Vector2(-50, this.contentWrapper.anchoredPosition.y);

				// this.navbarContentWrapper.sizeDelta = new Vector2(
				// 	this.contentWrapper.sizeDelta.x + (socialMenuHidden ? 81 : 341) - 110,
				// 	this.navbarContentWrapper.sizeDelta.y,
				// );
				this.navbarContentWrapper.anchorMin = new Vector2(0, 1);
				this.navbarContentWrapper.anchorMax = new Vector2(0, 1);
				this.navbarContentWrapper.pivot = new Vector2(0, 1);
				this.navbarContentWrapper.anchoredPosition = new Vector2(102, 0);
			}

			this.socialMenu.gameObject.SetActive(!socialMenuHidden);

			this.pages.offsetMax = new Vector2(0, 0);
			this.pages.offsetMin = new Vector2(0, this.pages.offsetMin.y);

			this.mobileNav.gameObject.SetActive(false);
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
