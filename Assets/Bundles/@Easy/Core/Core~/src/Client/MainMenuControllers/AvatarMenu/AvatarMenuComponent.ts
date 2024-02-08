import { Dependency } from "Shared/Flamework";
import { Outfit } from "Shared/Airship/Types/Outputs/PlatformInventory";
import { AvatarPlatformAPI } from "Shared/Avatar/AvatarPlatformAPI";
import { AvatarUtil } from "Shared/Avatar/AvatarUtil";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { CoreUI } from "Shared/UI/CoreUI";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { AuthController } from "../Auth/AuthController";
import { MainMenuController } from "../MainMenuController";
import MainMenuPageComponent from "../MainMenuPageComponent";
import { MainMenuPageType } from "../MainMenuPageName";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";

export default class AvatarMenuComponent extends MainMenuPageComponent {
	private readonly generalHookupKey = "General";
	private readonly tweenDuration = 0.15;
	private readonly highlightColor = ColorUtil.HexToColor("#3173C1");
	private readonly normalColor = ColorUtil.HexToColor("#505667");
	private subNavBarBtns: (CSArray<RectTransform> | undefined)[] = [];
	private mainNavBtns?: CSArray<RectTransform>;
	private subNavBars?: CSArray<RectTransform>;
	private outfitBtns?: CSArray<RectTransform>;
	private activeMainIndex = -1;
	private activeSubIndex = -1;

	public itemButtonHolder?: Transform;
	public itemButtonTemplate?: GameObject;
	public avatarRenderHolder?: GameObject;
	public categoryLabelTxt?: TextMeshProUGUI;

	private currentSlot: AccessorySlot = AccessorySlot.Root;
	private outfits?: Outfit[];
	private currentUserOutfit?: Outfit;
	private currentUserOutfitIndex = -1;
	private clientId = -1;

	//public buttons?: Transform[];

	private Log(message: string) {
		print("Avatar Editor: " + message);
	}

	override Init(mainMenu: MainMenuController, pageType: MainMenuPageType): void {
		super.Init(mainMenu, pageType);
		this.clientId = 9999; //Dependency<PlayerController>().clientId;

		this.mainNavBtns = this.refs?.GetAllValues<RectTransform>("MainNavRects");
		this.subNavBars = this.refs?.GetAllValues<RectTransform>("SubNavHolderRects");
		this.outfitBtns = this.refs?.GetAllValues<RectTransform>("OutfitRects");

		let i = 0;

		//Hookup Nav buttons
		if (!this.mainNavBtns) {
			warn("Unablet to find main nav btns on Avatar Editor Page");
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

		//Hookup outfit buttons
		if (!this.outfitBtns) {
			warn("Unable to find outfit btns on Avatar Editor Page");
			return;
		}
		for (i = 0; i < this.outfitBtns.Length; i++) {
			const outfitI = i;
			const go = this.outfitBtns.GetValue(i).gameObject;
			CoreUI.SetupButton(go, { noHoverSound: true });
			CanvasAPI.OnClickEvent(go, () => {
				this.SelectOutfit(outfitI);
			});
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

		this.ClearItembuttons();
		this.InitializeAutherizedAccessories();
	}

	override OpenPage(): void {
		super.OpenPage();
		this.Log("Open AVATAR");
		if (this.avatarRenderHolder) {
			this.Log("Showing avatar render");
			this.avatarRenderHolder?.SetActive(true);
		} else {
			error("No avatar render veiew in avatar editor menu page");
		}
		let avatarView = this.mainMenu?.avatarView;
		if (avatarView) {
			avatarView.CameraFocusTransform(avatarView.cameraWaypointBirdsEye, true);
		} else {
			error("no 3D avatar to render in avatar editor");
		}

		task.spawn(() => {
			this.LoadAllOutfits();
			this.SelectMainNav(0);
		});
	}

	override ClosePage(instant?: boolean): void {
		super.ClosePage(instant);
		this.Log("Close AVATAR");
		this.avatarRenderHolder?.SetActive(false);
		if (this.mainMenu?.avatarView) {
			this.mainMenu.avatarView.dragging = false;
		} else {
			error("no 3D avatar to render in avatar editor");
		}
	}

	private SelectMainNav(index: number) {
		if (this.activeMainIndex === index || !this.mainNavBtns || !this.subNavBars) {
			return;
		}

		this.Log("Selecting MAIN nav: " + index);
		let i = 0;
		this.activeMainIndex = index;

		//Highlight this category button
		for (i = 0; i < this.mainNavBtns.Length; i++) {
			const active = i === index;
			const nav = this.mainNavBtns.GetValue(i);
			//nav.TweenLocalScale(Vector3.one.mul(active ? 1.25 : 1), this.tweenDuration);
			let button = nav.gameObject.GetComponent<Button>();
			this.SetButtonColor(button, active);
			if (active && this.categoryLabelTxt) {
				this.categoryLabelTxt.text =
					button.gameObject.GetComponentsInChildren<TextMeshProUGUI>().GetValue(0).text ?? "No Category";
			}
		}

		//Show nave bar for this category
		/*for (i = 0; i < this.subNavBars.Length; i++) {
			const active = i === index;
			const nav = this.subNavBars.GetValue(i);
			nav.anchoredPosition = new Vector2(nav.anchoredPosition.x, 0);
			nav.gameObject.SetActive(active);
		}*/

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
				//nav.TweenLocalScale(Vector3.one.mul(active ? 1.25 : 1), this.tweenDuration);
				this.SetButtonColor(nav.gameObject.GetComponent<Button>(), active);
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
		if (foundItems) {
			this.DisplayItems(foundItems);
		}
		this.mainMenu?.avatarView?.CameraFocusSlot(slot);
	}

	private DisplayItems(items: AccessoryComponent[]) {
		if (items && items.size() > 0) {
			items.forEach((value) => {
				this.AddItemButton(value.name, () => {
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
				Object.Destroy(this.itemButtonHolder.GetChild(i).gameObject);
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

	private AddItemButton(itemName: string, onClickCallback: () => void) {
		if (this.itemButtonTemplate && this.itemButtonHolder) {
			let newButton = GameObjectUtil.InstantiateIn(this.itemButtonTemplate, this.itemButtonHolder);
			let eventIndex = CanvasAPI.OnClickEvent(newButton, onClickCallback);
			this.itemButtonBin.Add(() => {
				Bridge.DisconnectEvent(eventIndex);
			});
			let text = newButton.GetComponentsInChildren<TextMeshProUGUI>();
			if (text && text.Length > 0) {
				text.GetValue(0).text = itemName;
			}
			let image = newButton.transform.GetChild(0).GetComponent<Image>();
			if (image) {
				//AvatarPlatformAPI.LoadImage(itemData.imageId);
				image.enabled = false;
			}
		} else {
			error("Missing item template or holder for items on AvatarEditor");
		}
	}

	private SelectItem(acc?: AccessoryComponent) {
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
		//Select the item that is saved for this slot
		this.currentUserOutfit?.accessories.forEach((accessory, index) => {
			let accComponent = AvatarUtil.GetAccessoryFromClassId(accessory.class.classId);
			if (accComponent?.GetSlotNumber() === (this.currentSlot as number)) {
				this.SelectItem(accComponent);
			}
		});
	}

	private OnDragAvatar(down: boolean) {
		if (this.mainMenu?.avatarView) {
			this.mainMenu.avatarView.dragging = down;
		}
	}

	private InitializeAutherizedAccessories() {
		Dependency<AuthController>()
			.WaitForAuthed()
			.then(() => {
				//Get all owned accessories and map them to usable values
				AvatarUtil.GetOwnedAccessories();
				AvatarUtil.InitUserOutfits(Game.localPlayer.userId);
			});
	}

	private LoadAllOutfits() {
		this.Log("LoadAllOutfits");
		this.outfits = AvatarPlatformAPI.GetAllOutfits();
		const outfitSize = this.outfits ? this.outfits.size() : 0;
		if (outfitSize <= 0) {
			warn("No outfits exist on user. Making initial default one");
			this.outfits = [
				AvatarPlatformAPI.CreateDefaultAvatarOutfit(
					"9999",
					"Default0",
					"Default0",
					RandomUtil.FromArray(AvatarUtil.skinColors),
				),
			];
		}

		//Disable Outfit buttons that we don't need
		if (this.outfitBtns) {
			for (let i = 0; i < this.outfitBtns.Length; i++) {
				this.outfitBtns.GetValue(i).gameObject.SetActive(i < outfitSize);
			}
		}

		const equippedOutfit = AvatarPlatformAPI.GetEquippedOutfit();
		if (equippedOutfit && this.outfits) {
			let i = 0;
			for (let outfit of this.outfits) {
				if (outfit.outfitId === equippedOutfit.outfitId) {
					//Select equipped outfit
					this.Log("Found default outfit index: " + i);
					this.SelectOutfit(i);
					return;
				}
				i++;
			}
		}

		//Select the first outfit
		this.SelectOutfit(0);
	}

	private SelectOutfit(index: number) {
		this.Log("SelectOutfit: " + index);
		if (!this.outfits || index < 0 || index >= this.outfits.size()) {
			error("Index out of range of outfits");
		}
		this.currentUserOutfitIndex = index;
		if (this.outfitBtns) {
			for (let i = 0; i < this.outfitBtns.Length; i++) {
				let button = this.outfitBtns?.GetValue(index)?.GetComponent<Button>();
				if (button) {
					this.SetButtonColor(button, i === index);
				}
			}
		}
		this.currentUserOutfit = this.outfits[index];
		AvatarPlatformAPI.EquipAvatarOutfit(this.currentUserOutfit.outfitId);

		this.LoadCurrentOutfit();
	}

	private LoadCurrentOutfit() {
		const builder = this.mainMenu?.avatarView?.accessoryBuilder;
		if (!builder || !this.currentUserOutfit) {
			return;
		}
		builder.RemoveAccessories();

		this.Log("Loading outfit: " + this.currentUserOutfit.name);
		this.currentUserOutfit.accessories.forEach((acc, index) => {
			this.Log("Outfit acc: " + acc.class.name + ": " + acc.class.classId);
			this.SelectItem(AvatarUtil.GetAccessoryFromClassId(acc.class.classId));
		});

		//builder.TryCombineMeshes();
	}

	private Save() {
		if (!this.currentUserOutfit) {
			warn("Trying to save with no outfit selected!");
			return;
		}
		let accBuilder = this.mainMenu?.avatarView?.accessoryBuilder;
		let accessoryIds: string[] = [];
		if (accBuilder) {
			let accs = accBuilder.GetActiveAccessories();
			for (let i = 0; i < accs.Length; i++) {
				const instanceId = accs.GetValue(i).AccessoryComponent.serverInstanceId;
				if (instanceId === "") {
					warn("Trying to save avatar accessory without a proper instance ID");
				}
				accessoryIds[i] = instanceId;
			}
		}

		this.currentUserOutfit = AvatarPlatformAPI.SaveOutfitAccessories(this.currentUserOutfit.outfitId, accessoryIds);
		if (this.outfits) {
			this.outfits[this.currentUserOutfitIndex] = this.currentUserOutfit;
		}
	}

	private Revert() {
		this.LoadCurrentOutfit();
	}

	private SetButtonColor(button: Button, active: boolean) {
		let colors = button.colors;
		colors.normalColor = active ? this.highlightColor : this.normalColor;
		button.colors = colors;
	}
}
