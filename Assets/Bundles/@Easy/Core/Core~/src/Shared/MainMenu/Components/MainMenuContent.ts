import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { CoreLogger } from "../../Logger/CoreLogger";
import { Bin } from "../../Util/Bin";
import { MainMenuSingleton } from "../Singletons/MainMenuSingleton";
import { ScreenSizeType } from "../Singletons/ScreenSizeType";

export default class MainMenuContent extends AirshipBehaviour {
	public canvasRect!: RectTransform;
	public canvasScalar!: CanvasScaler;
	public contentWrapper!: RectTransform;
	public socialMenu!: RectTransform;
	public friendsPage!: RectTransform;
	public navbar!: RectTransform;
	public navbarContentWrapper!: RectTransform;
	public pages!: RectTransform;
	public searchFocused!: RectTransform;
	public mobileNav!: RectTransform;

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
		// CoreLogger.Log("screenSize.x: " + screenSize.x);
		CoreLogger.Log("dpi: " + Screen.dpi);
		CoreLogger.Log("resolution: " + Screen.currentResolution.width + ", " + Screen.currentResolution.height);

		if (Game.IsMobile()) {
			this.canvasScalar.scaleFactor = 2;
		} else if (Screen.dpi >= 255) {
			this.canvasScalar.scaleFactor = 1.6;
		} else {
			this.canvasScalar.scaleFactor = 1;
		}

		let sizeType: ScreenSizeType = "md";
		if (screenSize.x <= 1200) {
			sizeType = "sm";
		} else if (screenSize.x >= 1760) {
			sizeType = "lg";
		}
		this.mainMenu.sizeType = sizeType;

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

			this.navbar.sizeDelta = new Vector2(this.navbar.sizeDelta.x, 62);
			this.pages.offsetMax = new Vector2(0, -69);
			this.navbar.offsetMin = new Vector2(8, this.navbar.offsetMin.y);
			this.navbar.offsetMax = new Vector2(-8, this.navbar.offsetMax.y);

			this.searchFocused.offsetMin = new Vector2(2, 0);
			this.searchFocused.offsetMax = new Vector2(-2, -25);
			this.mobileNav.gameObject.SetActive(true);
		} else {
			if (Game.IsMobile()) {
				this.canvasScalar.matchWidthOrHeight = 0;
			} else {
				this.canvasScalar.matchWidthOrHeight = 1;
			}
			this.socialMenu.gameObject.SetActive(true);
			this.socialMenu.anchorMin = new Vector2(0, 1);
			this.socialMenu.anchorMax = new Vector2(0, 1);
			this.socialMenu.pivot = new Vector2(0, 1);
			this.socialMenu.sizeDelta = new Vector2(301, screenSize.y - 50);
			this.socialMenu.SetParent(this.gameObject.transform);

			// Landscape
			// this.canvasScalar.referenceResolution = new Vector2(1920, 1080);
			if (sizeType === "lg") {
				this.contentWrapper.anchorMin = new Vector2(0.5, 1);
				this.contentWrapper.anchorMax = new Vector2(0.5, 1);
				this.contentWrapper.pivot = new Vector2(0.5, 1);
				this.contentWrapper.anchoredPosition = new Vector2(-150, -67);
				this.contentWrapper.sizeDelta = new Vector2(math.min(screenSize.x - 400, 1050), screenSize.y - 67);

				this.navbarContentWrapper.sizeDelta = new Vector2(
					this.contentWrapper.sizeDelta.x + 40 + 301,
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
				this.contentWrapper.anchoredPosition = new Vector2(50, -67);
				this.contentWrapper.sizeDelta = new Vector2(screenSize.x - 400, screenSize.y - 67);

				this.navbarContentWrapper.sizeDelta = new Vector2(
					this.contentWrapper.sizeDelta.x + 40 + 301,
					this.navbarContentWrapper.sizeDelta.y,
				);
				this.navbarContentWrapper.anchorMin = new Vector2(0, 1);
				this.navbarContentWrapper.anchorMax = new Vector2(0, 1);
				this.navbarContentWrapper.pivot = new Vector2(0, 1);
				this.navbarContentWrapper.anchoredPosition = new Vector2(50, 0);
			}

			if (sizeType === "lg") {
				this.socialMenu.anchorMin = new Vector2(0, 1);
				this.socialMenu.anchorMax = new Vector2(0, 1);
				this.socialMenu.pivot = new Vector2(0, 1);
				let socialMenuPos = this.contentWrapper.anchoredPosition.add(new Vector2(40, -97));
				socialMenuPos = socialMenuPos
					.add(new Vector2(this.canvasRect.sizeDelta.x / 2, 0))
					.add(new Vector2(this.contentWrapper.sizeDelta.x / 2, 0));
				this.socialMenu.anchoredPosition = socialMenuPos;
			} else {
				this.socialMenu.anchorMin = new Vector2(1, 1);
				this.socialMenu.anchorMax = new Vector2(1, 1);
				this.socialMenu.pivot = new Vector2(1, 1);
				this.socialMenu.anchoredPosition = new Vector2(-10, this.contentWrapper.anchoredPosition.y - 97);
			}

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
