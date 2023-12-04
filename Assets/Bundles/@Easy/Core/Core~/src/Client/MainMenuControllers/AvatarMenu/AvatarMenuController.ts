import { Controller, OnStart } from "@easy-games/flamework-core";
import { MainMenuController } from "../MainMenuController";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";

@Controller({})
export class AvatarMenuController implements OnStart {
	private tweenDuration = 1;
	private AvatarRefKey = "Avatar";
	private refs?: GameObjectReferences;
	private navBars?: CSArray<RectTransform>;
	private mainNavBtns?: CSArray<RectTransform>;
	constructor(private readonly mainMenuController: MainMenuController) {}

	OnStart() {
		return;
		// print("Scene 3D: " + scene3D.name);
		// this.navBars = this.refs.GetAllValues<RectTransform>("NavBars");
		// this.mainNavBtns = this.refs.GetAllValues<RectTransform>("MainNavBtns");
	}

	private SelectMainNav(index: number) {
		if (!this.mainNavBtns || !this.navBars) {
			return;
		}
		let i = 0;

		for (i = 0; i < this.mainNavBtns.Length; i++) {
			const active = i === index;
			const nav = this.mainNavBtns.GetValue(i);
			nav.TweenLocalScale(Vector3.one.mul(active ? 1 : 0.75), this.tweenDuration);
			let button = nav.gameObject.GetComponent<Button>();
		}

		for (i = 0; i < this.navBars.Length; i++) {
			const active = i === index;
			const nav = this.navBars.GetValue(i);
			nav.gameObject.SetActive(active);
			nav.anchoredPosition = new Vector2(0, 0);
		}
	}
}
