import {} from "@easy-games/flamework-core";
import MainMenuPageComponent from "../MenuPageComponent";
import { CanvasAPI } from "Shared/Util/CanvasAPI";

export default class AvatarMenuComponent extends MainMenuPageComponent {
	private readonly tweenDuration = 1;

	private subNavBarBtns: (CSArray<RectTransform> | undefined)[] = [];
	private mainNavBtns?: CSArray<RectTransform>;
	private subNavBars?: CSArray<RectTransform>;
	private activeMainIndex = -1;

	private Log(message: string) {
		this.Log("Avatar Editor: " + message);
	}

	override OnStart() {
		super.OnStart();

		this.mainNavBtns = this.refs?.GetAllValues<RectTransform>("MainNavRects");
		this.subNavBars = this.refs?.GetAllValues<RectTransform>("SubNavHolderRects");
		let i = 0;

		if (!this.mainNavBtns) {
			return;
		}

		//Hookup sub nav buttons
		for (i = 0; i < this.mainNavBtns.Length; i++) {
			this.subNavBarBtns[i] = this.refs?.GetAllValues<RectTransform>("SubNavRects" + i);

			if (this.subNavBarBtns[i]) {
				for (let j = 0; j < this.subNavBarBtns.size(); j++) {
					const navI = i;
					const subNavI = j;
					const go = this.subNavBarBtns[i]?.GetValue(j).gameObject;
					if (go) {
						CanvasAPI.OnClickEvent(go, () => {
							this.SelectSubNav(navI, subNavI);
						});
					}
				}
			}
		}

		//
		for (i = 0; i < this.mainNavBtns.Length; i++) {
			const navI = i;
			CanvasAPI.OnClickEvent(this.mainNavBtns.GetValue(i).gameObject, () => {
				this.SelectMainNav(navI);
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
		if (!this.mainNavBtns || !this.subNavBars) {
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

		for (i = 0; i < this.subNavBars.Length; i++) {
			const active = i === index;
			const nav = this.subNavBars.GetValue(i);
			nav.anchoredPosition = new Vector2(0, 0);
			nav.gameObject.SetActive(active);
		}
	}

	private SelectSubNav(mainIndex: number, subIndex: number) {
		this.Log("Selecting SUB nav: " + subIndex);
		if (!this.subNavBarBtns) {
			return;
		}
		let subBar = this.subNavBarBtns[this.activeMainIndex];
		if (subBar) {
			for (let i = 0; i < subBar.Length; i++) {
				const active = i === subIndex;
				let button = subBar.GetValue(i).gameObject.GetComponent<Button>();
				button.colors.normalColor = active ? Color.red : Color.white;
			}
		}
	}
}
