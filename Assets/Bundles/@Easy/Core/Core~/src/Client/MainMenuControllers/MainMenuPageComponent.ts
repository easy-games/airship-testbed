import {} from "@easy-games/flamework-core";
import { MainMenuPageType } from "./MainMenuPageName";
import { SetTimeout } from "Shared/Util/Timer";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { MainMenuController } from "./MainMenuController";

export default class MainMenuPageComponent extends AirshipBehaviour {
	private animateOutDuration = 0.1;
	private animateInDuration = 0.1;

	public usesAvatarRender = false;

	public pageType: MainMenuPageType = MainMenuPageType.HOME;
	protected refs?: GameObjectReferences;

	private activePage = false;
	protected mainMenu?: MainMenuController;

	public Init(mainMenu: MainMenuController, pageType: MainMenuPageType) {
		this.mainMenu = mainMenu;
		this.pageType = pageType;
		this.refs = this.gameObject.GetComponent<GameObjectReferences>();
	}

	public OpenPage() {
		this.activePage = true;
		this.gameObject.SetActive(true);

		print("Opening page: " + this.gameObject.name);
		print("Opening page: " + gameObject.name);

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

	public ClosePage() {
		this.activePage = false;
		print("Closeing page: " + this.gameObject.name);
		print("Closeing page: " + gameObject.name);

		// gameObject.GetComponent<RectTransform>().TweenLocalPosition(new Vector3(-20, 0, 0), 0.1);
		const canvasGroup = this.gameObject.GetComponent<CanvasGroup>();
		canvasGroup?.TweenCanvasGroupAlpha(0, this.animateOutDuration);
		SetTimeout(this.animateOutDuration, () => {
			if (this.activePage) {
				this.gameObject.SetActive(false);
			}
		});
	}
}
