import {} from "@easy-games/flamework-core";
import MainMenuPageComponent from "../MainMenuPageComponent";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";

export default class AvatarMenuComponent extends MainMenuPageComponent {
	private readonly GeneralHookupKey = "General";
	private readonly tweenDuration = 1;

	private subNavBarBtns: (CSArray<RectTransform> | undefined)[] = [];
	private mainNavBtns?: CSArray<RectTransform>;
	private subNavBars?: CSArray<RectTransform>;
	private activeMainIndex = -1;

	public itemButtonHolder?: Transform;
	public itemButtonTemplate?: GameObject;

	//public buttons?: Transform[];

	private Log(message: string) {
		this.Log("Avatar Editor: " + message);
	}

	override OnStart() {
		this.refs = gameObject.GetComponent<GameObjectReferences>();

		this.mainNavBtns = this.refs?.GetAllValues<RectTransform>("MainNavRects");
		this.subNavBars = this.refs?.GetAllValues<RectTransform>("SubNavHolderRects");

		let i = 0;

		//Hookup Nav buttons
		task.delay(2, () => {
			if (!this.mainNavBtns) {
				return;
			}
			for (i = 0; i < this.mainNavBtns.Length; i++) {
				const navI = i;
				// CanvasAPI.OnClickEvent(this.mainNavBtns.GetValue(i).gameObject, () => {
				// 	this.SelectMainNav(navI);
				// });

				let subNavRects = this.refs?.GetAllValues<RectTransform>("SubNavRects" + (i + 1));
				this.subNavBarBtns[i] = subNavRects;
				if (subNavRects) {
					for (let j = 0; j < subNavRects.Length; j++) {
						const navI = i;
						const subNavI = j;
						const go = subNavRects.GetValue(j).gameObject;
						if (go) {
							print(
								"setting up sub nav: " +
									i +
									", " +
									j +
									": " +
									this.mainNavBtns.GetValue(i).gameObject.name +
									", " +
									go.name,
							);
							CanvasAPI.OnClickEvent(go, () => {
								this.SelectSubNav(navI, subNavI);
							});
						}
					}
				}
			}

			//Hookup general buttons
			// CanvasAPI.OnDragEvent(
			// 	this.refs?.GetValue<RectTransform>(this.GeneralHookupKey, "AvatarInteractionBtn").gameObject,
			// 	() => {
			// 		this.OnDragAvatar();
			// 	},
			// );

			// CanvasAPI.OnDragEvent(this.refs?.GetValue<RectTransform>(this.GeneralHookupKey, "ClearBtn").gameObject, () => {
			// 	this.OnSelectClear();
			// });

			// CanvasAPI.OnDragEvent(
			// 	this.refs?.GetValue<RectTransform>(this.GeneralHookupKey, "CurrentBtn").gameObject,
			// 	() => {
			// 		this.OnSelectCurrent();
			// 	},
			// );
		});
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

		this.SelectSubNav(index, 0);
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
		this.DisplayItems(AccessorySlot.Hat);
	}

	private DisplayItems(slotType: AccessorySlot) {
		const items = ItemUtil.GetAllAvatarItems(slotType);
		if (items) {
			items.forEach((value) => {
				this.AddItemButton(value);
			});
		}
	}

	private AddItemButton(acc: Accessory) {
		print("loading item: " + acc.DisplayName);
		if (this.itemButtonTemplate && this.itemButtonHolder) {
			GameObjectUtil.InstantiateIn(this.itemButtonTemplate, this.itemButtonHolder);
		}
	}

	private OnSelectClear() {
		//Unequip this slot
	}

	private OnSelectCurrent() {
		//Select the item that is saved for this sot
	}

	private OnDragAvatar() {
		//Move the avatar in the 3D scene
	}
}
