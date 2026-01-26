import {} from "@Easy/Core/Shared/Flamework";
import { MainMenuController } from "../../../Client/ProtectedControllers//MainMenuController";
import { MainMenuPageType } from "../../../Client/ProtectedControllers//MainMenuPageName";

export default class MainMenuPageComponent extends AirshipBehaviour {
	private animateOutDuration = 0.1;

	public animateIn = true;
	public dontSetPositionOnOpen = false;

	public pageType: MainMenuPageType = MainMenuPageType.Home;
	protected refs?: GameObjectReferences;

	private activePage = this.gameObject.activeInHierarchy;
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

		const rect = this.transform as RectTransform;
		const canvasGroup = this.gameObject.GetComponent<CanvasGroup>()!;
		canvasGroup.alpha = 1;

		if (!this.dontSetPositionOnOpen) {
			const targetY = this.GetTargetAnchoredPositionY();
			if (this.animateIn) {
				rect.anchoredPosition = new Vector2(0, targetY - 20);
				NativeTween.AnchoredPositionY(rect, targetY, 0.2).SetEaseQuadOut();
			} else {
				rect.anchoredPosition = new Vector2(0, targetY);
			}
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
