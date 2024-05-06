import { Game } from "@Easy/Core/Shared/Game";
import {} from "Shared/Flamework";
import { SetTimeout } from "Shared/Util/Timer";
import { MainMenuController } from "../../../Client/ProtectedControllers//MainMenuController";
import { MainMenuPageType } from "../../../Client/ProtectedControllers//MainMenuPageName";

export default class MainMenuPageComponent extends AirshipBehaviour {
	private animateOutDuration = 0.1;
	private animateInDuration = 0.1;

	public pageType: MainMenuPageType = MainMenuPageType.Home;
	protected refs?: GameObjectReferences;

	private activePage = false;
	protected mainMenu?: MainMenuController;

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
			this.ClosePage(true);
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
		if (this.animateInDuration <= 0 || Game.IsPortrait()) {
			(this.gameObject.transform as RectTransform).anchoredPosition = new Vector2(0, targetY);
			canvasGroup.alpha = 1;
		} else {
			const rect = this.transform as RectTransform;
			rect.anchoredPosition = new Vector2(0, targetY - 20);
			rect.TweenAnchoredPositionY(targetY, this.animateInDuration);
			canvasGroup.alpha = 0;
			canvasGroup.TweenCanvasGroupAlpha(1, this.animateInDuration);
		}
	}

	public GetTargetAnchoredPositionY(): number {
		return 0;
	}

	public ClosePage(instant = false) {
		if (!this.activePage && !instant) {
			return;
		}
		this.activePage = false;
		// print("closing page: " + this.pageType);

		// gameObject.GetComponent<RectTransform>()!.TweenLocalPosition(new Vector3(-20, 0, 0), 0.1);
		const canvasGroup = this.gameObject.GetComponent<CanvasGroup>()!;
		canvasGroup?.TweenCanvasGroupAlpha(0, this.animateOutDuration);
		SetTimeout(instant ? 0 : this.animateOutDuration, () => {
			if (!this.activePage) {
				this.gameObject.SetActive(false);
			}
		});
	}
}
