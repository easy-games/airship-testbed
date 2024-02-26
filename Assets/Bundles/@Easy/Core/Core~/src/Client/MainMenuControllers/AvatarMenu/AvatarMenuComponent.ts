import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { OutfitDto } from "Shared/Airship/Types/Outputs/PlatformInventory";
import { AvatarPlatformAPI } from "Shared/Avatar/AvatarPlatformAPI";
import { AvatarUtil } from "Shared/Avatar/AvatarUtil";
import { Dependency } from "Shared/Flamework";
import { Game } from "Shared/Game";
import { CoreUI } from "Shared/UI/CoreUI";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { AuthController } from "../Auth/AuthController";
import { MainMenuController } from "../MainMenuController";
import MainMenuPageComponent from "../MainMenuPageComponent";
import { MainMenuPageType } from "../MainMenuPageName";
import AvatarMenuBtn from "./AvatarMenuBtn";
import { Mouse } from "@Easy/Core/Shared/UserInput/Mouse";

export default class AvatarMenuComponent extends MainMenuPageComponent {
	private readonly generalHookupKey = "General";
	private readonly tweenDuration = 0.15;

	@Header("Templates")
	public itemButtonTemplate?: GameObject;

	@Header("References")
	public canvas?: Canvas;
	public avatarRenderHolder?: GameObject;
	public avatarCenterRect?: RectTransform;
	public categoryLabelTxt?: TextMeshProUGUI;
	public mainContentHolder?: Transform;

	@Header("Button Holders")
	public outfitButtonHolder!: Transform;
	public mainNavButtonHolder!: Transform;
	//public subNavBarButtonHolder!: Transform;
	//public subBarHolders: Transform[] = [];

	private outfitBtns: AvatarMenuBtn[] = [];
	private mainNavBtns: AvatarMenuBtn[] = [];
	//private subNavBtns: AvatarMenuBtn[] = [];
	//private subBarBtns: AvatarMenuBtn[][] = [[]]; //Each sub category has its own list of buttons

	private activeMainIndex = -1;
	private activeSubIndex = -1;
	private activeAccessories = new Map<AccessorySlot, string>();
	//private currentSlot: AccessorySlot = AccessorySlot.Root;
	private outfits?: OutfitDto[];
	private currentUserOutfit?: OutfitDto;
	private currentUserOutfitIndex = -1;
	private currentContentBtns: { id: string; button: AvatarMenuBtn }[] = [];
	private clientId = -1;
	private selectedAccessories = new Map<string, boolean>();
	private selectedColor = "";
	private selectedFaceId = -1;
	private bin: Bin = new Bin();
	private mouse!: Mouse;
	private saveBtn?: AvatarMenuBtn;

	private Log(message: string) {
		// print("Avatar Editor: " + message + " (" + Time.time + ")");
	}

	override Init(mainMenu: MainMenuController, pageType: MainMenuPageType): void {
		super.Init(mainMenu, pageType);
		this.clientId = 9999; //Dependency<PlayerController>().clientId;

		this.mainNavBtns = this.mainNavButtonHolder.gameObject.GetComponentsInChildren<AvatarMenuBtn>();
		//this.subNavBtns = this.subNavBarButtonHolder.gameObject.GetComponentsInChildren<AvatarMenuBtn>();
		this.outfitBtns = this.outfitButtonHolder.gameObject.GetComponentsInChildren<AvatarMenuBtn>();

		let i = 0;

		this.mainMenu?.avatarView?.OnNewRenderTexture((texture) => {
			let image = this.avatarRenderHolder?.GetComponent<RawImage>();
			if (image) {
				image.texture = texture;
			}
			this.RefreshAvatar();
		});

		//Hookup Nav buttons
		if (!this.mainNavBtns) {
			warn("Unablet to find main nav btns on Avatar Editor Page");
			return;
		}
		for (i = 0; i < this.mainNavBtns.size(); i++) {
			const navI = i;
			CoreUI.SetupButton(this.mainNavBtns[i].gameObject, { noHoverSound: true });
			CanvasAPI.OnClickEvent(this.mainNavBtns[i].gameObject, () => {
				this.SelectMainNav(navI);
			});

			/*let subNavRects = this.refs?.GetAllValues<RectTransform>("SubNavRects" + (i + 1));
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
			}*/
		}

		//Hookup outfit buttons
		if (!this.outfitBtns) {
			warn("Unable to find outfit btns on Avatar Editor Page");
			return;
		}
		for (i = 0; i < this.outfitBtns.size(); i++) {
			const outfitI = i;
			const go = this.outfitBtns[i].gameObject;
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
		// button = this.refs?.GetValue<RectTransform>(this.generalHookupKey, "ClearBtn").gameObject;
		// if (button) {
		// 	CoreUI.SetupButton(button, { noHoverSound: true });
		// 	CanvasAPI.OnClickEvent(button, () => {
		// 		this.OnSelectClear();
		// 	});
		// }

		// button = this.refs?.GetValue<RectTransform>(this.generalHookupKey, "CurrentBtn").gameObject;
		// if (button) {
		// 	CoreUI.SetupButton(button, { noHoverSound: true });
		// 	CanvasAPI.OnClickEvent(button, () => {
		// 		this.OnSelectCurrent();
		// 	});
		// }

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
		this.saveBtn = button?.GetAirshipComponent<AvatarMenuBtn>();

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

	private RefreshAvatar() {
		let avatarView = this.mainMenu?.avatarView;
		if (avatarView) {
			if (this.avatarCenterRect) {
				avatarView.AlignCamera(this.avatarCenterRect.position);
			}
		} else {
			error("no 3D avatar to render in avatar editor");
		}
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
		this.RefreshAvatar();
		this.mainMenu?.avatarView?.CameraFocusTransform(this.mainMenu?.avatarView?.cameraWaypointDefault, true);

		this.SelectMainNav(0);
		this.SelectSubNav(0);

		this.mouse = this.bin.Add(new Mouse());
		this.bin.Connect(this.mouse.scrolled, (event) => {
			if (math.abs(event.delta) > 1) {
				this.mainMenu?.avatarView?.CameraFocusSlot(AccessorySlot.Root);
			}
		});

		task.spawn(() => {
			this.LoadAllOutfits();
		});
	}

	override ClosePage(instant?: boolean): void {
		super.ClosePage(instant);
		this.Log("Close AVATAR");
		this.bin.Clean();
		this.avatarRenderHolder?.SetActive(false);
		if (this.mainMenu?.avatarView) {
			this.mainMenu.avatarView.dragging = false;
		} else {
			error("no 3D avatar to render in avatar editor");
		}
	}

	private SelectMainNav(index: number) {
		if (this.activeMainIndex === index || !this.mainNavBtns) {
			return;
		}

		this.Log("Selecting MAIN nav: " + index);
		let i = 0;
		this.activeMainIndex = index;

		//Highlight this category button
		for (i = 0; i < this.mainNavBtns.size(); i++) {
			const nav = this.mainNavBtns[i];
			nav.SetText(nav.gameObject.GetComponentsInChildren<TextMeshProUGUI>().GetValue(0).text ?? "No Category");
			nav.SetHighlight(i === index);
		}

		//Show nav bar for this category
		/*for (i = 0; i < this.subNavBars.Length; i++) {
			const active = i === index;
			const nav = this.subNavBars[i];
			nav.anchoredPosition = new Vector2(nav.anchoredPosition.x, 0);
			nav.gameObject.SetActive(active);
		}*/

		this.SelectSubNav(0);
	}

	private SelectSubNav(subIndex: number) {
		this.Log("Selecting SUB nav: " + subIndex);
		this.activeSubIndex = subIndex;
		// let subBar = this.subBarBtns[this.activeMainIndex];
		// if (subBar) {
		// 	for (let i = 0; i < subBar.size(); i++) {
		// 		subBar[i].SetHighlight(i === subIndex);
		// 	}
		// }

		this.Log("Buttons.1");
		this.ClearItembuttons();
		this.Log("Buttons.2");

		let targetSlot = AccessorySlot.Root;
		switch (this.activeMainIndex) {
			case 0:
				//BODY
				switch (subIndex) {
					case 0:
						//SKIN COLOR
						targetSlot = AccessorySlot.Root;
						this.Log("DisplayColorScheme");
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
				//FACE
				this.DisplayFaceItems();
				this.UpdateButtonGraphics();
				return;
			case 2:
				//HAIR
				targetSlot = AccessorySlot.Root;
				break;
			case 3:
				//HEAD
				switch (subIndex) {
					case 0:
						targetSlot = AccessorySlot.Head;
						this.DisplayItemsOfType(AccessorySlot.Hair);
						break;
					case 1:
						targetSlot = AccessorySlot.Ears;
						break;
					case 2:
						targetSlot = AccessorySlot.Nose;
						break;
				}
				break;
			case 4:
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
			case 5:
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
			case 6:
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
			case 7:
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
		this.Log("Buttons.3");

		this.DisplayItemsOfType(targetSlot);
		this.UpdateButtonGraphics();
	}

	private DisplayItemsOfType(slot: AccessorySlot) {
		this.Log("Displaying item type: " + tostring(slot));

		//this.currentSlot = slot;

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
				this.AddItemButton(value.serverClassId, value.name, () => {
					//Accessory
					this.SelectItem(value);
				});
			});
		} else {
			this.Log("Displaying no items");
		}
	}

	private DisplayFaceItems() {
		let faceItems = AvatarUtil.GetAllAvatarFaceItems();
		if (faceItems) {
			faceItems.forEach((value) => {
				this.AddItemButton(value.serverClassId, value.name, () => {
					//Accessory
					this.SelectFaceItem(value);
				});
			});
		}
	}

	private itemButtonBin: Bin = new Bin();
	private ClearItembuttons() {
		this.Log("ClearItemButtons");
		this.itemButtonBin.Clean();
		this.currentContentBtns.clear();
		if (this.mainContentHolder) {
			this.mainContentHolder.gameObject.ClearChildren();
		}
	}

	private DisplayColorScheme() {
		for (let i = 0; i < AvatarUtil.skinColors.size(); i++) {
			this.AddColorButton(AvatarUtil.skinColors[i]);
		}
		this.UpdateButtonGraphics();
	}

	private DisplaySkinTextures() {
		let items = AvatarUtil.GetAllAvatarSkins();
		if (items && items.size() > 0) {
			items.forEach((value) => {
				this.AddItemButton(value.ToString(), value.ToString(), () => {
					//Accessory
					this.SelectSkinItem(value);
				});
			});
		} else {
			this.Log("Displaying no skin items");
		}
	}

	private AddColorButton(color: Color) {
		if (this.itemButtonTemplate && this.mainContentHolder) {
			let newButton = Object.Instantiate(this.itemButtonTemplate, this.mainContentHolder);
			let eventIndex = CanvasAPI.OnClickEvent(newButton, () => {
				//Skin Color
				this.SelectSkinColor(color);
			});
			this.itemButtonBin.Add(() => {
				Bridge.DisconnectEvent(eventIndex);
			});
			let menuBtn = newButton.GetAirshipComponent<AvatarMenuBtn>();
			if (menuBtn) {
				menuBtn.SetButtonColor(color);
				menuBtn.iconImage.color = color;
				this.currentContentBtns.push({ id: ColorUtil.ColorToHex(color), button: menuBtn });
			} else {
				error("Unable to find AvatarMenuBtn on color button");
			}
		} else {
			error("Missing item template or holder for items on AvatarEditor");
		}
	}

	private AddItemButton(classId: string, itemName: string, onClickCallback: () => void) {
		if (this.itemButtonTemplate && this.mainContentHolder) {
			let newButton = Object.Instantiate(this.itemButtonTemplate, this.mainContentHolder);
			let eventIndex = CanvasAPI.OnClickEvent(newButton, onClickCallback);
			this.itemButtonBin.Add(() => {
				Bridge.DisconnectEvent(eventIndex);
			});

			let menuBtn = newButton.GetAirshipComponent<AvatarMenuBtn>();
			if (menuBtn) {
				menuBtn.SetText(itemName);
				//TODO: Removed the image until we can load it from the server
				menuBtn.iconImage.enabled = false;
				this.currentContentBtns.push({ id: classId, button: menuBtn });

				//download the items thumbnail
				let cloudImage = newButton.gameObject.AddComponent<CloudImage>();
				cloudImage.image = menuBtn.iconImage;
				cloudImage.url = AvatarUtil.GetClassThumbnailUrl(classId);

				const downloadConn = cloudImage.OnFinishedLoading((success) => {
					if (success) {
						cloudImage.image.enabled = true;
						if (menuBtn) {
							menuBtn.labelText.enabled = false;
						}
					}
				});
				this.bin.Add(() => {
					Bridge.DisconnectEvent(downloadConn);
				});

				print("Downloading: " + cloudImage.url);
				cloudImage.StartDownload();
			} else {
				error("Unable to find AvatarMenuBtn on item button");
			}
		} else {
			error("Missing item template or holder for items on AvatarEditor");
		}
	}

	private SelectItem(acc?: AccessoryComponent, instantRefresh = true) {
		if (!acc) {
			return;
		}
		const alreadySelected = this.activeAccessories.get(acc.GetSlotNumber()) === acc.serverClassId;
		this.RemoveItem(acc.GetSlotNumber(), instantRefresh);
		if (alreadySelected) {
			//Already selected this item so just deselect it
			this.UpdateButtonGraphics();
			return;
		}
		this.Log("Selecting item: " + acc.ToString());
		this.mainMenu?.avatarView?.accessoryBuilder?.AddSingleAccessory(acc, instantRefresh);
		this.activeAccessories.set(acc.GetSlotNumber(), acc.serverClassId);
		this.selectedAccessories.set(acc.serverClassId, true);
		this.UpdateButtonGraphics();
		this.saveBtn?.SetEnabled(true);
	}

	private SelectFaceItem(face: AccessoryFace, instantRefresh = true) {
		if (!face) {
			return;
		}
		this.Log("Selecting face item: " + face.ToString());
		this.mainMenu?.avatarView?.accessoryBuilder?.SetFaceTexture(face.decalTexture);
		this.selectedFaceId = face.GetInstanceID();
		this.UpdateButtonGraphics();
		this.saveBtn?.SetEnabled(true);
	}

	private SelectSkinItem(acc: AccessorySkin, instantRefresh = true) {
		if (!acc) {
			return;
		}
		this.Log("Selecting skin item: " + acc.ToString());
		this.mainMenu?.avatarView?.accessoryBuilder?.AddSkinAccessory(acc, instantRefresh);
		this.saveBtn?.SetEnabled(true);
	}

	private SelectSkinColor(color: Color, instantRefresh = true) {
		this.Log("Selecting Color: " + color);
		this.mainMenu?.avatarView?.accessoryBuilder?.SetSkinColor(color, instantRefresh);
		this.selectedColor = ColorUtil.ColorToHex(color);
		this.UpdateButtonGraphics();
		this.saveBtn?.SetEnabled(true);
	}

	// private OnSelectClear(instantRefresh = true) {
	// 	this.Log("Clearing Item: " + this.currentSlot);
	// 	//Unequip this slot
	// 	if (this.currentSlot !== AccessorySlot.Root) {
	// 		this.RemoveItem(this.currentSlot, instantRefresh);
	// 	}
	// }

	private RemoveItem(slot: AccessorySlot, instantRefresh = true) {
		print("removing slot: " + slot);
		this.mainMenu?.avatarView?.accessoryBuilder?.RemoveAccessorySlot(slot, instantRefresh);
		let classId = this.activeAccessories.get(slot);
		print("removing class id: " + classId);
		if (classId && classId !== "") {
			this.selectedAccessories.delete(classId);
		}
		this.activeAccessories.set(slot, "");
	}

	// private OnSelectCurrent() {
	// 	this.Log("Selecting currently saved Item");
	// 	//Select the item that is saved for this slot
	// 	this.currentUserOutfit?.accessories.forEach((accessory, index) => {
	// 		let accComponent = AvatarUtil.GetAccessoryFromClassId(accessory.class.classId);
	// 		if (accComponent?.GetSlotNumber() === (this.currentSlot as number)) {
	// 			this.SelectItem(accComponent);
	// 		}
	// 	});
	// }

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
			for (let i = 0; i < this.outfitBtns.size(); i++) {
				this.outfitBtns[i].gameObject.SetActive(i < outfitSize);
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

		//Select the first outfit if no outfit was found
		this.SelectOutfit(0);
	}

	private SelectOutfit(index: number) {
		this.Log("SelectOutfit: " + index);
		if (!this.outfits || index < 0 || index >= this.outfits.size()) {
			error("Index out of range of outfits");
		}
		this.currentUserOutfitIndex = index;
		for (let i = 0; i < this.outfitBtns.size(); i++) {
			this.outfitBtns[i].SetHighlight(i === index);
		}
		this.currentUserOutfit = this.outfits[index];
		AvatarPlatformAPI.EquipAvatarOutfit(this.currentUserOutfit.outfitId);
		if (Game.context === CoreContext.GAME) {
			CoreNetwork.ClientToServer.ChangedOutfit.client.FireServer();
		}

		this.LoadCurrentOutfit();
	}

	private ClearAllAccessories() {
		this.mainMenu?.avatarView?.accessoryBuilder?.RemoveAccessories();
		this.selectedAccessories.clear();
		this.activeAccessories.clear();
	}

	private LoadCurrentOutfit() {
		if (!this.currentUserOutfit) {
			return;
		}
		this.ClearAllAccessories();
		this.saveBtn?.SetEnabled(false);
		this.Log("Loading outfit: " + this.currentUserOutfit.name);
		this.currentUserOutfit.accessories.forEach((acc, index) => {
			this.Log("Outfit acc: " + acc.class.name + ": " + acc.class.classId);
			this.SelectItem(AvatarUtil.GetAccessoryFromClassId(acc.class.classId), false);
		});

		this.SelectSkinColor(ColorUtil.HexToColor(this.currentUserOutfit.skinColor), true);

		this.UpdateButtonGraphics();
		//builder.TryCombineMeshes();
	}

	private UpdateButtonGraphics() {
		//Highlight selected items
		for (let i = 0; i < this.currentContentBtns.size(); i++) {
			let button = this.currentContentBtns[i];
			this.Log("Checking button: " + button.id);
			//Found matching class ID or this button is the active color
			let active =
				this.selectedColor === button.id ||
				this.selectedAccessories.has(this.currentContentBtns[i].id) ||
				this.selectedFaceId.ToString() === button.id;
			button.button.SetHighlight(active);
		}
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
		if (Game.context === CoreContext.GAME) {
			CoreNetwork.ClientToServer.ChangedOutfit.client.FireServer();
		}
	}

	private Revert() {
		this.LoadCurrentOutfit();
	}
}
