import {} from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { MainMenuController } from "../../../Client/ProtectedControllers//MainMenuController";
import { MainMenuPageType } from "../../../Client/ProtectedControllers//MainMenuPageName";

export default class MainMenuPageComponent extends AirshipBehaviour {
	private animateOutDuration = 0.1;
	public animateInDuration = 0.1;

	public pageType: MainMenuPageType = MainMenuPageType.Home;
	protected refs?: GameObjectReferences;

	private activePage = false;
	protected mainMenu: MainMenuController;

	/**
	 * **DO NOT YIELD INSIDE THIS METHOD.**
	 * @param mainMenu
	 * @param pageType
	 */
	public Init(mainMenu: MainMenuController, pageType: MainMenuPageType) {
		this.mainMenu = mainMenu;
		this.pageType = pageType;
		this.refs = this.gameObject.GetComponent<GameObjectReferences>()!;
		if (pageType === MainMenuPageType.Home) {
			// this.OpenPage();
		} else {
			this.ClosePage();
		}
	}

	/**
	 * **DO NOT YIELD INSIDE THIS METHOD**
	 * @returns
	 */
	public OpenPage(params?: unknown) {
		if (this.activePage) {
			return;
		}
		this.activePage = true;
		this.gameObject.SetActive(true);
		this.mainMenu?.avatarView?.HideAvatar();

		const canvasGroup = this.gameObject.GetComponent<CanvasGroup>()!;
		const targetY = this.GetTargetAnchoredPositionY();
		if (this.animateInDuration <= 0 || Game.IsPortrait() || true) {
			(this.gameObject.transform as RectTransform).anchoredPosition = new Vector2(0, targetY);
			canvasGroup.alpha = 1;
		} else {
			// const rect = this.transform as RectTransform;
			// rect.anchoredPosition = new Vector2(0, targetY - 20);
			// const tween = NativeTween.AnchoredPositionY(rect, targetY, this.animateInDuration).SetUseUnscaledTime(true);
			// tween.SetEase(EaseType.QuadOut);
			(this.gameObject.transform as RectTransform).anchoredPosition = new Vector2(0, targetY);

			canvasGroup.alpha = 0;
			NativeTween.CanvasGroupAlpha(canvasGroup, 1, this.animateInDuration).SetUseUnscaledTime(true);
		}
	}

	public GetTargetAnchoredPositionY(): number {
		return 0;
	}

	public ClosePage() {
		if (!this.activePage) {
			return;
		}
		this.activePage = false;
		this.gameObject.SetActive(false);
	}
}
