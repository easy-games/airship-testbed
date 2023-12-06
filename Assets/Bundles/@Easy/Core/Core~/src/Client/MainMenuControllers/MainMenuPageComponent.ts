import {} from "@easy-games/flamework-core";
import { MainMenuPageType } from "./MainMenuPageName";
import { SetTimeout } from "Shared/Util/Timer";
import { CanvasAPI } from "Shared/Util/CanvasAPI";

export default class MainMenuPageComponent extends AirshipBehaviour {
	private animateOutDuration = 0.1;
	private animateInDuration = 0.1;

	public pageType: MainMenuPageType = MainMenuPageType.HOME;
	protected refs?: GameObjectReferences;

	private activePage = false;

	public override OnStart(): void {
		this.refs = gameObject.GetComponent<GameObjectReferences>();

		let button = this.refs?.GetAllValues<RectTransform>("MainNavRects");
		if (button) {
			print("BUTTON: " + button.GetValue(0).GetComponent<Button>().name);
			CanvasAPI.OnClickEventTEST(button.GetValue(0).gameObject, () => {
				print("IS THIS WORKING");
			});
			print("BUTTON DONE");
		}
	}

	public TEST() {
		print("MAIN MENU PAGE COMPONENT TEST!");
	}

	public OpenPage() {
		this.activePage = true;
		gameObject.SetActive(true);

		const canvasGroup = gameObject.GetComponent<CanvasGroup>();
		if (this.animateInDuration <= 0) {
			gameObject.transform.localPosition = new Vector3(0, 0, 0);
			canvasGroup.alpha = 1;
		} else {
			gameObject.transform.localPosition = new Vector3(0, -20, 0);
			gameObject.GetComponent<RectTransform>().TweenLocalPosition(new Vector3(0, 0, 0), this.animateInDuration);
			canvasGroup.alpha = 0;
			canvasGroup.TweenCanvasGroupAlpha(1, this.animateInDuration);
		}
	}

	public ClosePage() {
		this.activePage = false;

		// gameObject.GetComponent<RectTransform>().TweenLocalPosition(new Vector3(-20, 0, 0), 0.1);
		gameObject.GetComponent<CanvasGroup>().TweenCanvasGroupAlpha(0, this.animateOutDuration);
		SetTimeout(this.animateOutDuration, () => {
			if (this.activePage) {
				gameObject.SetActive(false);
			}
		});
	}
}
