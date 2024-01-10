import { Dependency } from "@easy-games/flamework-core";
import { AvatarUtil } from "Shared/Avatar/AvatarUtil";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { CoreUI } from "Shared/UI/CoreUI";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { MainMenuController } from "../MainMenuController";
import MainMenuPageComponent from "../MainMenuPageComponent";
import { MainMenuPageType } from "../MainMenuPageName";
import { PlayerController } from "Client/Controllers/Player/PlayerController";
import { Accessory, AvatarPlatformAPI, Outfit } from "Shared/Avatar/AvatarPlatformAPI";
import { RandomUtil } from "Shared/Util/RandomUtil";

export default class AvatarMenuComponent extends MainMenuPageComponent {
	private readonly generalHookupKey = "General";
	private readonly tweenDuration = 0.15;

	private subNavBarBtns: (CSArray<RectTransform> | undefined)[] = [];
	private mainNavBtns?: CSArray<RectTransform>;
	private subNavBars?: CSArray<RectTransform>;
	private activeMainIndex = -1;
	private activeSubIndex = -1;

	public itemButtonHolder?: Transform;
	public itemButtonTemplate?: GameObject;

	private currentSlot: AccessorySlot = AccessorySlot.Root;
	private currentOutfit?: Outfit;

	//public buttons?: Transform[];

	private Log(message: string) {
		// print("Avatar Editor: " + message);
	}

	override Init(mainMenu: MainMenuController, pageType: MainMenuPageType): void {
		super.Init(mainMenu, pageType);
		this.mainNavBtns = this.refs?.GetAllValues<RectTransform>("MainNavRects");
		this.subNavBars = this.refs?.GetAllValues<RectTransform>("SubNavHolderRects");

		let i = 0;

		//Hookup Nav buttons
		if (!this.mainNavBtns) {
			print("Unablet to find main nav btns on Avatar Editor Page");
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
		let button = this.refs?.GetValue<RectTransform>(this.generalHookupKey, "AvatarInteractionBtn").gameObject;
		if (button) {
			CoreUI.SetupButton(button, { noHoverSound: true });
			CanvasAPI.OnBeginDragEvent(button, () => {
				this.OnDragAvatar(true);
			});
			CanvasAPI.OnEndDragEvent(button, () => {
				this.OnDragAvatar(false);
			});
		}
		button = this.refs?.GetValue<RectTransform>(this.generalHookupKey, "ClearBtn").gameObject;
		if (button) {
			CoreUI.SetupButton(button, { noHoverSound: true });
			CanvasAPI.OnClickEvent(button, () => {
				this.OnSelectClear();
			});
		}

		button = this.refs?.GetValue<RectTransform>(this.generalHookupKey, "CurrentBtn").gameObject;
		if (button) {
			CoreUI.SetupButton(button, { noHoverSound: true });
			CanvasAPI.OnClickEvent(button, () => {
				this.OnSelectCurrent();
			});
		}

		button = this.refs?.GetValue<RectTransform>(this.generalHookupKey, "ResetCameraBtn").gameObject;
		if (button) {
			CoreUI.SetupButton(button, { noHoverSound: true });
			CanvasAPI.OnClickEvent(button, () => {
				this.mainMenu?.avatarView?.CameraFocusSlot(AccessorySlot.Root);
			});
		}

		button = this.refs?.GetValue<RectTransform>(this.generalHookupKey, "SaveBtn").gameObject;
		if (button) {
			CoreUI.SetupButton(button, { noHoverSound: true });
			CanvasAPI.OnClickEvent(button, () => {
				this.Save();
			});
		}

		button = this.refs?.GetValue<RectTransform>(this.generalHookupKey, "RevertBtn").gameObject;
		if (button) {
			CoreUI.SetupButton(button, { noHoverSound: true });
			CanvasAPI.OnClickEvent(button, () => {
				this.Revert();
			});
		}
	}

	override OpenPage(): void {
		super.OpenPage();
		this.Log("Open AVATAR");
		let avatarView = this.mainMenu?.avatarView;
		if (avatarView) {
			avatarView.CameraFocusTransform(avatarView.cameraWaypointBirdsEye, true);
		}
		this.SelectMainNav(0);
	}

	override ClosePage(instant?: boolean): void {
		super.ClosePage(instant);
		this.Log("Close AVATAR");
		if (this.mainMenu?.avatarView) {
			this.mainMenu.avatarView.dragging = false;
		}
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
		this.activeSubIndex = subIndex;
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

		this.ClearItembuttons();

		let targetSlot = AccessorySlot.Root;
		switch (this.activeMainIndex) {
			case 0:
				//BODY
				switch (subIndex) {
					case 0:
						//SKIN COLOR
						targetSlot = AccessorySlot.Root;
						this.DisplayColorScheme();
						break;
					case 1:
						//SKIN TEXTURE
						targetSlot = AccessorySlot.Root;
						this.DisplaySkinTextures();
						break;
					case 2:
						//FACE
						targetSlot = AccessorySlot.Root;
						break;
					case 3:
						//FACE SHAPE
						targetSlot = AccessorySlot.Root;
						break;
					case 4:
						//HAIR
						targetSlot = AccessorySlot.Hair;
						break;
				}
				break;
			case 1:
				//HEAD
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
				//TORSO
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
					case 3:
						targetSlot = AccessorySlot.Backpack;
						break;
				}
				break;
			case 3:
				//HANDS
				switch (subIndex) {
					case 0:
						targetSlot = AccessorySlot.Hands;
						break;
					case 1:
						targetSlot = AccessorySlot.RightWrist;
						this.DisplayItemsOfType(AccessorySlot.LeftWrist);
						break;
					case 2:
						targetSlot = AccessorySlot.HandsOuter;
						break;
				}
				break;
			case 4:
				//LEGS
				switch (subIndex) {
					case 0:
						targetSlot = AccessorySlot.Legs;
						break;
					case 1:
						targetSlot = AccessorySlot.LegsOuter;
						break;
					case 2:
						targetSlot = AccessorySlot.LegsInner;
						break;
				}
				break;
			case 5:
				//FEET
				switch (subIndex) {
					case 0:
						targetSlot = AccessorySlot.Feet;
						break;
					case 1:
						targetSlot = AccessorySlot.FeetInner;
						break;
					case 2:
						targetSlot = AccessorySlot.RightFoot;
						this.DisplayItemsOfType(AccessorySlot.LeftFoot);
						break;
				}
				break;
		}

		this.DisplayItemsOfType(targetSlot);
	}

	private DisplayItemsOfType(slot: AccessorySlot) {
		this.Log("Displaying item type: " + tostring(slot));

		this.currentSlot = slot;
		//Accessories
		let foundItems = AvatarUtil.GetAllAvatarItems(slot);
		this.DisplayItems(foundItems);
		this.mainMenu?.avatarView?.CameraFocusSlot(slot);
	}

	private DisplayItems(items: AccessoryComponent[] | undefined) {
		if (items && items.size() > 0) {
			items.forEach((value) => {
				this.AddItemButton(value.ToString(), () => {
					//Accessory
					this.SelectItem(value);
				});
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

	private DisplayColorScheme() {
		for (let i = 0; i < AvatarUtil.skinColors.size(); i++) {
			this.AddColorButton(AvatarUtil.skinColors[i]);
		}
	}

	private DisplaySkinTextures() {
		let items = AvatarUtil.GetAllAvatarSkins();
		if (items && items.size() > 0) {
			items.forEach((value) => {
				this.AddItemButton(value.ToString(), () => {
					//Accessory
					this.SelectSkinItem(value);
				});
			});
		} else {
			this.Log("Displaying no skin items");
		}
	}

	private AddColorButton(color: Color) {
		if (this.itemButtonTemplate && this.itemButtonHolder) {
			let newButton = GameObjectUtil.InstantiateIn(this.itemButtonTemplate, this.itemButtonHolder);
			let eventIndex = CanvasAPI.OnClickEvent(newButton, () => {
				//Skin Color
				this.SelectSkinColor(color);
			});
			this.itemButtonBin.Add(() => {
				Bridge.DisconnectEvent(eventIndex);
			});
			let button = newButton.transform.GetComponent<Button>();
			let newColors = button.colors;
			newColors.selectedColor = Color.white;
			newColors.normalColor = Color.white;
			button.colors = newColors;
			let image1 = newButton.transform.GetComponent<Image>();
			let image2 = newButton.transform.GetChild(0).GetComponent<Image>();
			image1.color = color;
			image2.enabled = false;
		} else {
			error("Missing item template or holder for items on AvatarEditor");
		}
	}

	private AddItemButton(name: string, onClickCallback: () => void) {
		if (this.itemButtonTemplate && this.itemButtonHolder) {
			let newButton = GameObjectUtil.InstantiateIn(this.itemButtonTemplate, this.itemButtonHolder);
			let eventIndex = CanvasAPI.OnClickEvent(newButton, onClickCallback);
			this.itemButtonBin.Add(() => {
				Bridge.DisconnectEvent(eventIndex);
			});
			let text = newButton.GetComponentsInChildren<TextMeshProUGUI>();
			if (text && text.Length > 0) {
				text.GetValue(0).text = name;
			}
			let image = newButton.transform.GetChild(0).GetComponent<Image>();
			if (image) {
				image.enabled = false;
			}
		} else {
			error("Missing item template or holder for items on AvatarEditor");
		}
	}

	private SelectItem(acc: AccessoryComponent) {
		if (!acc) {
			return;
		}
		this.Log("Selecting item: " + acc.ToString());
		this.mainMenu?.avatarView?.accessoryBuilder?.AddSingleAccessory(acc, true);
	}

	private SelectSkinItem(acc: AccessorySkin) {
		if (!acc) {
			return;
		}
		this.Log("Selecting skin item: " + acc.ToString());
		this.mainMenu?.avatarView?.accessoryBuilder?.AddSkinAccessory(acc, true);
	}

	private SelectSkinColor(color: Color) {
		this.Log("Selecting Color: " + color);
		this.mainMenu?.avatarView?.accessoryBuilder?.SetSkinColor(color, true);
	}

	private OnSelectClear() {
		this.Log("Clearing Item: " + this.currentSlot);
		//Unequip this slot
		if (this.currentSlot !== AccessorySlot.Root) {
			this.mainMenu?.avatarView?.accessoryBuilder?.RemoveAccessorySlot(this.currentSlot, true);
		}
	}

	private OnSelectCurrent() {
		this.Log("Selecting currently saved Item");
		//Select the item that is saved for this sot
	}

	private OnDragAvatar(down: boolean) {
		if (this.mainMenu?.avatarView) {
			print("Dragging avatar: " + down);
			this.mainMenu.avatarView.dragging = down;
		}
	}

	private LoadOrCreateOutfit() {
		this.currentOutfit = AvatarPlatformAPI.GetEquippedOutfit();
		if (!this.currentOutfit) {
			//No outfit equipped
			let allOutfits = AvatarPlatformAPI.GetAllOutfits();
			if (allOutfits && allOutfits.size() > 0) {
				//Has outfits though
				this.currentOutfit = allOutfits[0];
				AvatarPlatformAPI.EquipAvatarOutfit(this.currentOutfit.outfitId);
			} else {
				//No outfits exist so create one
				this.currentOutfit = AvatarPlatformAPI.CreateDefaultAvatarOutfit(
					Dependency<PlayerController>().clientId.ToString(),
					"Default0",
					"Default 0",
					RandomUtil.FromArray(AvatarUtil.skinColors),
				);
			}
		}
	}

	private Save() {
		if (!this.currentOutfit) {
			Debug.LogError("Trying to save with no outfit selected!");
			return;
		}
		const outfitId = "Default";
		let accBuilder = this.mainMenu?.avatarView?.accessoryBuilder;
		if (accBuilder) {
			let accs = accBuilder.GetActiveAccessories();
			let accessories: Accessory[] = [];
			for (let i = 0; i < accs.Length; i++) {
				let acc = accs.GetValue(i);
				//TODO fill outfit with new accessories
				//accessories[i] = 0;
			}
		}
	}

	private Revert() {}
}
