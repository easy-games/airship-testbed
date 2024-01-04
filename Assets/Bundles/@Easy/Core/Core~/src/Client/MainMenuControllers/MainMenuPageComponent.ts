import {} from "@easy-games/flamework-core";
import { SetTimeout } from "Shared/Util/Timer";
import { MainMenuController } from "./MainMenuController";
import { MainMenuPageType } from "./MainMenuPageName";

export default class MainMenuPageComponent extends AirshipBehaviour {
	private animateOutDuration = 0.1;
	private animateInDuration = 0.1;

	public pageType: MainMenuPageType = MainMenuPageType.Home;
	protected refs?: GameObjectReferences;

	private activePage = false;
	protected mainMenu?: MainMenuController;

	public Init(mainMenu: MainMenuController, pageType: MainMenuPageType) {
		print("MAIN MENU COMPONENT INIT: " + pageType);
		this.mainMenu = mainMenu;
		this.pageType = pageType;
		this.refs = this.gameObject.GetComponent<GameObjectReferences>();
		if (pageType === MainMenuPageType.Home) {
			this.OpenPage();
		} else {
			this.ClosePage(true);
		}
	}

	public OpenPage() {
		if (this.activePage) {
			return;
		}
		print("Opened page: " + this.pageType);
		this.activePage = true;
		this.gameObject.SetActive(true);

		const canvasGroup = this.gameObject.GetComponent<CanvasGroup>();
		if (canvasGroup && this.animateInDuration <= 0) {
			this.gameObject.transform.localPosition = new Vector3(0, 0, 0);
			canvasGroup.alpha = 1;
		} else {
			this.gameObject.transform.localPosition = new Vector3(0, -20, 0);
			this.gameObject
				.GetComponent<RectTransform>()
				.TweenLocalPosition(new Vector3(0, 0, 0), this.animateInDuration);
			canvasGroup.alpha = 0;
			canvasGroup.TweenCanvasGroupAlpha(1, this.animateInDuration);
		}
	}

	public ClosePage(instant = false) {
		if (!this.activePage && !instant) {
			return;
		}
		this.activePage = false;
		print("closing page: " + this.pageType);

		// gameObject.GetComponent<RectTransform>().TweenLocalPosition(new Vector3(-20, 0, 0), 0.1);
		const canvasGroup = this.gameObject.GetComponent<CanvasGroup>();
		canvasGroup?.TweenCanvasGroupAlpha(0, this.animateOutDuration);
		SetTimeout(instant ? 0 : this.animateOutDuration, () => {
			if (!this.activePage) {
				this.gameObject.SetActive(false);
			}
		});
	}
}
