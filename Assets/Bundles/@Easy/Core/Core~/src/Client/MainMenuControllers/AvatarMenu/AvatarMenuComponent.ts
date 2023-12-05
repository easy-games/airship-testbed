import {} from "@easy-games/flamework-core";
import MainMenuPageComponent from "../MenuPageComponent";
import { CanvasAPI } from "Shared/Util/CanvasAPI";

export default class AvatarMenuComponent extends MainMenuPageComponent {
	private readonly tweenDuration = 1;

	private navBars?: CSArray<RectTransform>;
	private mainNavBtns?: CSArray<RectTransform>;
	private activeMainIndex = -1;

	private Log(message: string) {
		this.Log("Avatar Editor: " + message);
	}

	override OnStart() {
		super.OnStart();

		this.navBars = this.refs?.GetAllValues<RectTransform>("NavBars");
		this.mainNavBtns = this.refs?.GetAllValues<RectTransform>("MainNavBtns");

		if (!this.mainNavBtns || !this.navBars) {
			return;
		}

		let i = 0;
		for (i = 0; i < this.mainNavBtns.Length; i++) {
			const navI = i;
			CanvasAPI.OnClickEvent(this.mainNavBtns.GetValue(i).gameObject, () => {
				this.SelectMainNav(navI);
			});
		}

		for (i = 0; i < this.navBars.Length; i++) {
			const navI = i;
			CanvasAPI.OnClickEvent(this.navBars.GetValue(i).gameObject, () => {
				this.SelectSubNav(navI);
			});
		}
	}

	override OpenPage(): void {
		super.OpenPage();
		this.Log("Open AVATAR");
		this.SelectMainNav(0);
	}
	override ClosePage(): void {
		super.ClosePage();
		this.Log("Close AVATAR");
	}

	private SelectMainNav(index: number) {
		if (!this.mainNavBtns || !this.navBars) {
			return;
		}

		this.Log("Selecting MAIN nav: " + index);
		let i = 0;
		this.activeMainIndex = index;

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

	private SelectSubNav(index: number) {
		this.Log("Selecting SUB nav: " + index);
		let subBar = this.navBars?.GetValue(this.activeMainIndex);
		if (subBar) {
		}
	}
}
