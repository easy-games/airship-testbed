import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { MainMenuSingleton } from "../Singletons/MainMenuSingleton";
import { ScreenSizeType } from "../Singletons/ScreenSizeType";

export default class MainMenuContent extends AirshipBehaviour {
	public canvasRect!: RectTransform;
	public canvasScalar!: CanvasScaler;
	public contentWrapper!: RectTransform;
	public socialMenu!: RectTransform;
	public navbar!: RectTransform;
	public navbarBottom!: RectTransform;
	public navbarControls!: RectTransform;
	public pages!: RectTransform;
	public searchFocused!: RectTransform;

	private mainMenu!: MainMenuSingleton;

	public Awake(): void {}

	override Start(): void {
		this.mainMenu = Dependency<MainMenuSingleton>();
		this.CalcLayout();
	}

	public Update(dt: number): void {
		if (this.canvasRect.sizeDelta !== this.mainMenu.screenSize) {
			this.mainMenu.screenSize = this.canvasRect.sizeDelta;
			this.CalcLayout();
		}
	}

	public CalcLayout(): void {
		const screenSize = this.mainMenu.screenSize;

		let sizeType: ScreenSizeType = "md";
		print("screenSize.x", screenSize.x);
		if (screenSize.x <= 910) {
			sizeType = "sm";
		} else if (screenSize.x >= 1900) {
			sizeType = "lg";
		}

		if (Game.IsPortrait()) {
			// this.canvasScalar.referenceResolution = new Vector2(1080, 1920);
			this.socialMenu.gameObject.SetActive(false);
			this.contentWrapper.sizeDelta = new Vector2(screenSize.x * 0.98, screenSize.y);
			this.contentWrapper.anchorMin = new Vector2(0.5, 1);
			this.contentWrapper.anchorMax = new Vector2(0.5, 1);
			this.contentWrapper.pivot = new Vector2(0.5, 1);
			this.contentWrapper.anchoredPosition = new Vector2(0, -Game.GetNotchHeight());

			this.navbarBottom.gameObject.SetActive(false);
			this.navbar.sizeDelta = new Vector2(this.navbar.sizeDelta.x, 62);
			this.pages.offsetMax = new Vector2(0, -69);
			this.navbarControls.gameObject.SetActive(false);
			this.navbar.offsetMin = new Vector2(8, this.navbar.offsetMin.y);
			this.navbar.offsetMax = new Vector2(-8, this.navbar.offsetMax.y);

			this.searchFocused.offsetMin = new Vector2(2, 0);
			this.searchFocused.offsetMax = new Vector2(-2, -25);
		} else {
			this.socialMenu.gameObject.SetActive(true);

			// Landscape
			this.canvasScalar.referenceResolution = new Vector2(1920, 1080);
			if (sizeType === "lg") {
				this.contentWrapper.anchorMin = new Vector2(0.5, 1);
				this.contentWrapper.anchorMax = new Vector2(0.5, 1);
				this.contentWrapper.pivot = new Vector2(0.5, 1);
				this.contentWrapper.anchoredPosition = new Vector2(-50, 0);
				this.contentWrapper.sizeDelta = new Vector2(math.min(screenSize.x - 400, 1200), screenSize.y);

				this.socialMenu.anchoredPosition = new Vector2(-73, -20);
			} else {
				this.contentWrapper.anchorMin = new Vector2(0, 1);
				this.contentWrapper.anchorMax = new Vector2(0, 1);
				this.contentWrapper.pivot = new Vector2(0, 1);
				this.contentWrapper.anchoredPosition = new Vector2(50, 0);
				this.contentWrapper.sizeDelta = new Vector2(math.min(screenSize.x - 400, 1400), screenSize.y);

				this.socialMenu.anchoredPosition = new Vector2(-30, -20);
			}
			this.navbarBottom.gameObject.SetActive(true);
			this.navbar.sizeDelta = new Vector2(this.navbar.sizeDelta.x, 127);
			this.pages.offsetMax = new Vector2(0, -134);
			this.navbarControls.gameObject.SetActive(true);
			this.navbar.offsetMin = new Vector2(0, this.navbar.offsetMin.y);
			this.navbar.offsetMax = new Vector2(0, this.navbar.offsetMax.y);

			this.searchFocused.offsetMin = new Vector2(-10, 0);
			this.searchFocused.offsetMax = new Vector2(10, 0);
		}

		if (this.mainMenu.sizeType !== sizeType) {
			print("firing size type change: " + sizeType);
			this.mainMenu.sizeType = sizeType;
			this.mainMenu.onSizeTypeChanged.Fire(sizeType);
		}
	}

	override OnDestroy(): void {}
}
