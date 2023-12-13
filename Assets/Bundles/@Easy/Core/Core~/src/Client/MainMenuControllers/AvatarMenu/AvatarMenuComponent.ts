import {} from "@easy-games/flamework-core";
import MainMenuPageComponent from "../MainMenuPageComponent";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { CoreUI } from "Shared/UI/CoreUI";
import { MainMenuController } from "../MainMenuController";
import { MainMenuPageType } from "../MainMenuPageName";
import { Bin } from "Shared/Util/Bin";
import { AvatarUtils } from "Client/Avatar/AvatarUtil";

export default class AvatarMenuComponent extends MainMenuPageComponent {
	private readonly GeneralHookupKey = "General";
	private readonly tweenDuration = 0.15;

	private subNavBarBtns: (CSArray<RectTransform> | undefined)[] = [];
	private mainNavBtns?: CSArray<RectTransform>;
	private subNavBars?: CSArray<RectTransform>;
	private activeMainIndex = -1;

	public itemButtonHolder?: Transform;
	public itemButtonTemplate?: GameObject;
	public TESTBOOL?: boolean = true;
	public TESTFLOAT?: number = 10;
	public TESTGO?: GameObject;

	private currentSlot: AccessorySlot = AccessorySlot.Root;

	//public buttons?: Transform[];

	private Log(message: string) {
		print("Avatar Editor: " + message);
	}

	public Init(mainMenu: MainMenuController, pageType: MainMenuPageType) {
		super.Init(mainMenu, pageType);
		this.TESTFLOAT = 11;

		this.mainNavBtns = this.refs?.GetAllValues<RectTransform>("MainNavRects");
		this.subNavBars = this.refs?.GetAllValues<RectTransform>("SubNavHolderRects");

		let i = 0;

		//Hookup Nav buttons
		if (!this.mainNavBtns) {
			error("Unablet to find main nav btns on Avatar Editor Page");
			return;
		}
		for (i = 0; i < this.mainNavBtns.Length; i++) {
			const navI = i;
			CoreUI.SetupButton(this.mainNavBtns.GetValue(i).gameObject, { noHoverSound: true });
			CanvasAPI.OnClickEvent(this.mainNavBtns.GetValue(i).gameObject, () => {
				this.SelectMainNav(navI);
			});

			let subNavRects = this.refs?.GetAllValues<RectTransform>("SubNavRects" + (i + 1));
			this.subNavBarBtns[i] = subNavRects;
			if (subNavRects) {
				for (let j = 0; j < subNavRects.Length; j++) {
					const navI = i;
					const subNavI = j;
					const go = subNavRects.GetValue(j).gameObject;
					if (go) {
						CoreUI.SetupButton(go, { noHoverSound: true });
						CanvasAPI.OnClickEvent(go, () => {
							this.SelectSubNav(subNavI);
						});
					}
				}
			}
		}

		//Hookup general buttons
		let button = this.refs?.GetValue<RectTransform>(this.GeneralHookupKey, "AvatarInteractionBtn").gameObject;
		if (button) {
			CoreUI.SetupButton(button, { noHoverSound: true });
			CanvasAPI.OnDragEvent(button, () => {
				this.OnDragAvatar();
			});
		}
		button = this.refs?.GetValue<RectTransform>(this.GeneralHookupKey, "ClearBtn").gameObject;
		if (button) {
			CoreUI.SetupButton(button, { noHoverSound: true });
			CanvasAPI.OnDragEvent(button, () => {
				this.OnSelectClear();
			});
		}

		button = this.refs?.GetValue<RectTransform>(this.GeneralHookupKey, "CurrentBtn").gameObject;
		if (button) {
			CoreUI.SetupButton(button, { noHoverSound: true });
			CanvasAPI.OnDragEvent(button, () => {
				this.OnSelectCurrent();
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
			nav.TweenLocalScale(Vector3.one.mul(active ? 1.25 : 1), this.tweenDuration);
			let button = nav.gameObject.GetComponent<Button>();
			let colors = button.colors;
			colors.normalColor = active ? Color.green : Color.white;
			button.colors = colors;
		}

		for (i = 0; i < this.subNavBars.Length; i++) {
			const active = i === index;
			const nav = this.subNavBars.GetValue(i);
			nav.anchoredPosition = new Vector2(nav.anchoredPosition.x, 0);
			nav.gameObject.SetActive(active);
		}

		this.SelectSubNav(0);
	}

	private SelectSubNav(subIndex: number) {
		this.Log("Selecting SUB nav: " + subIndex);
		if (!this.subNavBarBtns) {
			return;
		}
		let subBar = this.subNavBarBtns[this.activeMainIndex];
		if (subBar) {
			for (let i = 0; i < subBar.Length; i++) {
				const active = i === subIndex;
				const nav = subBar.GetValue(i);
				nav.TweenLocalScale(Vector3.one.mul(active ? 1.25 : 1), this.tweenDuration);
				let button = nav.gameObject.GetComponent<Button>();
				let colors = button.colors;
				colors.normalColor = active ? Color.green : Color.white;
				button.colors = colors;
			}
		}

		let targetSlot = AccessorySlot.Root;
		switch (this.activeMainIndex) {
			case 1:
				switch (subIndex) {
					case 0:
						targetSlot = AccessorySlot.Head;
						break;
					case 1:
						targetSlot = AccessorySlot.Ears;
						break;
					case 2:
						targetSlot = AccessorySlot.Nose;
						break;
				}
				break;
			case 2:
				switch (subIndex) {
					case 0:
						targetSlot = AccessorySlot.Torso;
						break;
					case 1:
						targetSlot = AccessorySlot.TorsoOuter;
						break;
					case 2:
						targetSlot = AccessorySlot.TorsoInner;
						break;
				}
				break;
		}
		this.DisplayItemsOfType(targetSlot);
	}

	private DisplayItemsOfType(slot: AccessorySlot) {
		this.Log("Displaying item type: " + tostring(slot));
		let foundItems = AvatarUtils.GetAllAvatarItems(slot);
		this.DisplayItems(foundItems);
	}

	private DisplayItems(items: Accessory[] | undefined) {
		this.ClearItembuttons();
		if (items && items.size() > 0) {
			items.forEach((value) => {
				this.AddItemButton(value);
			});
		} else {
			this.Log("Displaying no items");
		}
	}

	private itemButtonBin: Bin = new Bin();
	private ClearItembuttons() {
		this.itemButtonBin.Clean();
		if (this.itemButtonHolder) {
			for (let i = 0; i < this.itemButtonHolder.GetChildCount(); i++) {
				GameObjectUtil.Destroy(this.itemButtonHolder.GetChild(i).gameObject);
			}
		}
	}

	private AddItemButton(acc: Accessory) {
		this.Log("loading item: " + acc.ToString());
		if (this.itemButtonTemplate && this.itemButtonHolder) {
			let newButton = GameObjectUtil.InstantiateIn(this.itemButtonTemplate, this.itemButtonHolder);
			let eventIndex = CanvasAPI.OnClickEvent(newButton, () => {
				this.SelectItem(acc);
			});
			this.itemButtonBin.Add(() => {
				Bridge.DisconnectEvent(eventIndex);
			});
		} else {
			error("Missing item template or holder for items on AvatarEditor");
		}
	}

	private SelectItem(acc: Accessory) {
		if (!acc) {
			return;
		}
		this.Log("Selecting item: " + acc.ToString());
		this.mainMenu?.avatarView?.accessoryBuilder?.AddSingleAccessory(acc, this.TESTBOOL ?? true);
	}

	private OnSelectClear() {
		this.Log("Clearing Item: " + this.currentSlot);
		//Unequip this slot
		if (this.currentSlot !== AccessorySlot.Root) {
			this.mainMenu?.avatarView?.accessoryBuilder?.RemoveAccessorySlot(this.currentSlot, this.TESTBOOL ?? true);
		}
	}

	private OnSelectCurrent() {
		this.Log("Selecting currently saved Item");
		//Select the item that is saved for this sot
	}

	private OnDragAvatar() {
		this.mainMenu?.avatarView?.DragView(Input.mouseScrollDelta);
	}
}
