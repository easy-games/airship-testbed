import { OutfitDto } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipPlatformInventory";
import { AvatarCollectionManager } from "@Easy/Core/Shared/Avatar/AvatarCollectionManager";
import { AvatarPlatformAPI } from "@Easy/Core/Shared/Avatar/AvatarPlatformAPI";
import AvatarViewComponent from "@Easy/Core/Shared/Avatar/AvatarViewComponent";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import AirshipButton from "@Easy/Core/Shared/MainMenu/Components/AirshipButton";
import { MainMenuSingleton } from "@Easy/Core/Shared/MainMenu/Singletons/MainMenuSingleton";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { Mouse } from "@Easy/Core/Shared/UserInput/Mouse";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import MainMenuPageComponent from "../../../Shared/MainMenu/Components/MainMenuPageComponent";
import { MainMenuController } from "../MainMenuController";
import { MainMenuPageType } from "../MainMenuPageName";
import AvatarAccessoryBtn from "./AvatarAccessoryBtn";
import AvatarMenuBtn from "./AvatarMenuBtn";
import AvatarMenuProfileComponent from "./AvatarMenuProfileComponent";
import AvatarRenderComponent from "./AvatarRenderComponent";
import OutfitButton from "./Outfit/OutfitButtonComponent";
import OutfitButtonNameComponent from "./Outfit/OutfitButtonNameComponent";
import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreAction } from "@Easy/Core/Shared/Input/AirshipCoreAction";

export default class AvatarMenuComponent extends MainMenuPageComponent {
	private readonly generalHookupKey = "General";
	private readonly tweenDuration = 0.15;

	@Header("Templates")
	public itemButtonTemplate?: GameObject;

	@Header("References")
	public mainCanvasGroup!: CanvasGroup;
	public avatarRenderHolder?: GameObject;
	public avatarCenterRect?: RectTransform;
	public categoryLabelTxt?: TextMeshProUGUI;
	public mainContentHolder?: Transform;
	public avatarProfileMenuGo?: GameObject;
	public avatarToolbar!: RectTransform;
	public avatarOptionsHolder!: RectTransform;
	public avatar3DHolder!: RectTransform;
	public contentScrollRect!: ScrollRect;

	public grid: GridLayoutGroup;

	@Header("Mobile Only References")
	public mobileTopBarScrollRect: ScrollRect;

	@Header("Button Holders")
	public outfitButtonHolder!: Transform;
	public mainNavButtonHolder!: Transform;
	//public subNavBarButtonHolder!: Transform;
	//public subBarHolders: Transform[] = [];

	@Header("Buttons")
	public revertBtn!: AirshipButton;
	public saveBtn: AirshipButton;
	public avatarInteractionBtn!: Button;

	@Header("Variables")
	public avatarCameraOffset = new Vector3(0, 0, 0);

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
	private currentContentBtns: { id: string; button: AvatarAccessoryBtn }[] = [];
	private clientId = -1;
	private selectedAccessories = new Map<string, boolean>();
	private selectedColor = "";
	private selectedFaceId = "";
	private bin: Bin = new Bin();
	private currentFocusedSlot: AccessorySlot = AccessorySlot.Root;
	private avatarProfileMenu?: AvatarMenuProfileComponent;
	private dirty = false;

	private discardTitle = "Discarding Changes!";
	private discardMessage = "Are you sure you want to discard changes to your outfit?";

	private Log(message: string) {
		//print("Avatar Editor: " + message + " (" + Time.time + ")");
	}

	override Init(mainMenu: MainMenuController, pageType: MainMenuPageType): void {
		super.Init(mainMenu, pageType);
		this.Log("Initializing Avatar Menu");
		this.clientId = 9999; //Dependency<PlayerController>().clientId;

		this.mainNavBtns = this.mainNavButtonHolder.gameObject.GetAirshipComponentsInChildren<AvatarMenuBtn>();
		this.outfitBtns = this.outfitButtonHolder.gameObject.GetAirshipComponentsInChildren<AvatarMenuBtn>();
		this.avatarProfileMenu = this.avatarProfileMenuGo?.GetAirshipComponent<AvatarMenuProfileComponent>();
		this.avatarProfileMenu?.Init(mainMenu);

		//Remove any dummy content
		if (this.mainContentHolder) {
			this.mainContentHolder.gameObject.ClearChildren();
		}

		let i = 0;
		//Hookup Nav buttons
		if (!this.mainNavBtns) {
			warn("Unable to find main nav btns on Avatar Editor Page");
			return;
		}
		for (i = 0; i < this.mainNavBtns.size(); i++) {
			const navI = i;
			const navBtn = this.mainNavBtns[i];
			CanvasAPI.OnClickEvent(this.mainNavBtns[i].gameObject, () => {
				if (this.mainNavBtns[navI].redirectScroll?.isDragging) return;
				this.SelectMainNav(navI);
			});
		}

		//Hookup outfit buttons
		if (!Game.IsMobile()) {
			if (!this.outfitBtns) {
				error("Unable to find outfit btns on Avatar Editor Page");
			}
			for (i = 0; i < this.outfitBtns.size(); i++) {
				const outfitI = i;
				const go = this.outfitBtns[i].gameObject;

				const outfitButton = go.GetAirshipComponent<OutfitButton>();
				if (outfitButton) outfitButton.outfitIdx = i;

				if (!Game.IsMobile()) {
					CanvasAPI.OnClickEvent(go, () => {
						task.spawn(async () => {
							if (this.dirty) {
								const res = await Dependency<MainMenuSingleton>().ShowConfirmModal(
									this.discardTitle,
									this.discardMessage,
								);
								if (!res) {
									return;
								}
							}

							this.SelectOutfit(outfitI);
						});
					});
				}
			}
		}

		//Hookup general buttons
		if (this.avatarInteractionBtn) {
			CanvasAPI.OnBeginDragEvent(this.avatarInteractionBtn.gameObject, () => {
				this.OnDragAvatar(true);
			});
			CanvasAPI.OnEndDragEvent(this.avatarInteractionBtn.gameObject, () => {
				this.OnDragAvatar(false);
			});
		}

		if (this.saveBtn) {
			this.saveBtn.button.onClick.Connect(() => {
				this.Save();
			});
		}

		if (this.revertBtn) {
			this.revertBtn.button.onClick.Connect(() => {
				this.Revert();
			});
		}

		this.ClearItembuttons();

		if (Game.IsEditor()) {
			Keyboard.OnKeyDown(Key.PrintScreen, (event) => {
				if (Keyboard.IsKeyDown(Key.LeftShift)) {
					if (this.inThumbnailMode) {
						this.LeaveThumbnailMode();
					} else {
						this.EnterThumbnailMode();
					}
				}
			});
		}
	}

	private RefreshAvatar() {
		let avatarView = this.mainMenu?.avatarView;
		if (avatarView) {
			if (this.avatarCenterRect) {
				avatarView.AlignCamera(this.avatarCenterRect.position, this.avatarCameraOffset);
			}
		} else {
			// error("no 3D avatar to render in avatar editor");
		}
	}

	private downloadedAccessories = false;

	override OpenPage(params?: unknown): void {
		super.OpenPage(params);

		AvatarCollectionManager.instance.Setup();

		this.SetDirty(false);
		this.LoadAllOutfits();

		const mainMenuSingleton = Dependency<MainMenuSingleton>();

		this.bin.Add(mainMenuSingleton.socialMenuModifier.Add({ hidden: true }));

		if (!this.downloadedAccessories) {
			this.downloadedAccessories = true;
			AvatarCollectionManager.instance.DownloadAllAccessories().then(() => {
				this.LoadAllOutfits();
			});
		}

		// Load the character
		if (this.mainMenu.avatarView === undefined) {
			if (Game.IsMobile()) {
				this.mainMenu.avatarView = Object.Instantiate(
					this.mainMenu.refs.GetValue<GameObject>("AvatarMobile", "Avatar3DSceneTemplate"),
					CoreRefs.protectedTransform,
				).GetAirshipComponent<AvatarViewComponent>()!;
			} else {
				this.mainMenu.avatarView = Object.Instantiate(
					this.mainMenu.refs.GetValue<GameObject>("Avatar", "Avatar3DSceneTemplate"),
					CoreRefs.protectedTransform,
				).GetAirshipComponent<AvatarViewComponent>()!;
			}
		}

		let rawImage = this.avatarRenderHolder?.GetComponent<RawImage>();
		if (rawImage) {
			rawImage.texture = mainMenuSingleton.avatarEditorRenderTexture;
			this.RefreshAvatar();
			this.bin.Add(
				mainMenuSingleton.onAvatarEditorRenderTextureUpdated.Connect((texture) => {
					rawImage.texture = texture;
					this.RefreshAvatar();
				}),
			);
		}

		if (!Game.IsMobile()) {
			this.bin.Add(
				Dependency<MainMenuController>().onBeforePageChange.Connect((event) => {
					if (this.dirty && event.oldPage === MainMenuPageType.Avatar) {
						print("showing confirm..");
						const [success, res] = Dependency<MainMenuSingleton>()
							.ShowConfirmModal(this.discardTitle, this.discardMessage)
							.await();
						print(`[${success}, ${res}]`);
						if (success && !res) {
							event.SetCancelled(true);
						}
					}
				}),
			);
		}

		//"Enter" should allow you to rename currently selected outfit button
		this.bin.Add(
			Keyboard.OnKeyDown(Key.Enter, (event) => {
				if (event.uiProcessed) return;
				if (!Dependency<MainMenuController>().IsOpen()) return;

				const currentButton = this.outfitBtns[this.currentUserOutfitIndex];
				if (!currentButton) return;

				const name = currentButton.gameObject.GetAirshipComponentInChildren<OutfitButtonNameComponent>();
				name?.StartRename();
			}),
		);

		this.avatarOptionsHolder.gameObject.SetActive(true);

		this.Log("Open AVATAR");
		if (this.avatarRenderHolder) {
			this.avatarRenderHolder?.SetActive(true);
		} else {
			error("No avatar render veiew in avatar editor menu page");
		}
		this.mainMenu?.avatarView?.ShowAvatar();
		this.mainMenu?.ToggleGameBG(false);
		this.RefreshAvatar();
		this.mainMenu?.avatarView?.CameraFocusTransform(this.mainMenu?.avatarView?.cameraWaypointDefault, true);

		this.SelectMainNav(0);
		this.SelectSubNav(0);

		this.bin.Connect(Mouse.onScrolled, (event) => {
			if (event.delta < -1) {
				this.mainMenu?.avatarView?.CameraFocusSlot(AccessorySlot.Root);
			} else if (event.delta > 1) {
				this.mainMenu?.avatarView?.CameraFocusSlot(this.currentFocusedSlot);
			}
		});
	}

	override ClosePage(): void {
		super.ClosePage();
		this.Log("Close AVATAR");
		this.bin.Clean();
		this.avatarRenderHolder?.SetActive(false);
		this.mainMenu?.ToggleGameBG(true);
		if (this.mainMenu?.avatarView) {
			this.mainMenu.avatarView.dragging = false;
		} else {
			// error("no 3D avatar to render in avatar editor");
		}
	}

	private SelectMainNav(index: number) {
		if (this.activeMainIndex === index || !this.mainNavBtns || this.inThumbnailMode) {
			return;
		}

		if (Game.IsMobile()) {
			if (index === 0) {
				// Skin color
				this.grid.cellSize = new Vector2(120, 120);
			} else {
				this.grid.cellSize = new Vector2(120, 150);
			}
		}

		this.Log("Selecting MAIN nav: " + index);
		let i = 0;
		this.activeMainIndex = index;

		//Highlight this category button
		for (i = 0; i < this.mainNavBtns.size(); i++) {
			const nav = this.mainNavBtns[i];
			nav.SetSelected(i === index);
			if (i === index && this.categoryLabelTxt) {
				this.categoryLabelTxt.text =
					nav.gameObject.GetComponentsInChildren<TextMeshProUGUI>().GetValue(0).text ?? "No Category";
			}
		}

		this.SelectSubNav(0);
	}

	private SelectSubNav(subIndex: number) {
		if (this.inThumbnailMode) {
			return;
		}
		this.activeSubIndex = subIndex;

		this.ClearItembuttons();

		switch (this.activeMainIndex) {
			case 0:
				//SKIN COLOR
				this.Log("DisplayColorScheme");
				this.DisplayColorScheme();
				break;
			case 1:
				//FACE
				this.DisplayFaceItems();
				this.UpdateButtonGraphics();
				return;
			case 2:
				//HAIR
				this.DisplayItemsOfType(AccessorySlot.Hair);
				break;
			case 3:
				//HEAD
				this.DisplayItemsOfType(AccessorySlot.Head);
				this.DisplayItemsOfType(AccessorySlot.Face);
				this.DisplayItemsOfType(AccessorySlot.Ears);
				this.DisplayItemsOfType(AccessorySlot.Nose);
				this.DisplayItemsOfType(AccessorySlot.Neck);
				break;
			case 4:
				//TORSO
				this.DisplayItemsOfType(AccessorySlot.Torso);
				this.DisplayItemsOfType(AccessorySlot.Backpack);
				this.DisplayItemsOfType(AccessorySlot.TorsoOuter);
				this.DisplayItemsOfType(AccessorySlot.TorsoInner);
				break;
			case 5:
				//HANDS
				this.DisplayItemsOfType(AccessorySlot.Hands);
				this.DisplayItemsOfType(AccessorySlot.RightWrist);
				this.DisplayItemsOfType(AccessorySlot.LeftWrist);
				this.DisplayItemsOfType(AccessorySlot.HandsOuter);
				break;
			case 6:
				//LEGS
				this.DisplayItemsOfType(AccessorySlot.Legs);
				this.DisplayItemsOfType(AccessorySlot.LegsOuter);
				this.DisplayItemsOfType(AccessorySlot.LegsInner);
				break;
			case 7:
				//FEET
				this.DisplayItemsOfType(AccessorySlot.Feet);
				this.DisplayItemsOfType(AccessorySlot.FeetInner);
				this.DisplayItemsOfType(AccessorySlot.RightFoot);
				this.DisplayItemsOfType(AccessorySlot.LeftFoot);
				break;
		}
		this.UpdateButtonGraphics();
	}

	private DisplayItemsOfType(slot: AccessorySlot) {
		this.Log("Displaying item type: " + tostring(slot));

		//this.currentSlot = slot;

		//Accessories
		let foundItems = AvatarCollectionManager.instance.GetAllAvatarItems(slot);
		if (foundItems) {
			this.DisplayItems(foundItems);
		}
		this.currentFocusedSlot = slot;
		this.mainMenu?.avatarView?.CameraFocusSlot(slot);
	}

	private DisplayItems(items: { instanceId: string; item: AccessoryComponent }[]) {
		if (items && items.size() > 0) {
			items.forEach((value) => {
				this.AddItemButton(value.item.GetServerClassId(), value.instanceId, value.name, () => {
					//Accessory
					this.SelectItem(value.instanceId, value.item);
				});
			});
		} else {
			this.Log("Displaying no items");
		}
	}

	private DisplayFaceItems() {
		let faceItems = AvatarCollectionManager.instance.GetAllAvatarFaceItems();
		if (faceItems) {
			faceItems.forEach((value) => {
				this.AddItemButton(value.GetServerClassId(), value.serverInstanceId, value.name, () => {
					//Accessory
					this.SelectFaceItem(value);
				});
			});
		}
		this.mainMenu?.avatarView?.CameraFocusSlot(AccessorySlot.Face);
	}

	private itemButtonBin: Bin = new Bin();
	private ClearItembuttons() {
		this.Log("ClearItemButtons");
		//Highlight selected items
		for (let i = 0; i < this.currentContentBtns.size(); i++) {
			//PoolManager.ReleaseObject(this.currentContentBtns[i].button.gameObject);
			Object.Destroy(this.currentContentBtns[i].button.gameObject);
		}
		this.itemButtonBin.Clean();
		this.currentContentBtns.clear();
	}

	private DisplayColorScheme() {
		for (let i = 0; i < AvatarCollectionManager.instance.skinColors.size(); i++) {
			this.AddColorButton(AvatarCollectionManager.instance.skinColors[i]);
		}
		this.UpdateButtonGraphics();
		this.mainMenu?.avatarView?.CameraFocusSlot(AccessorySlot.Root);
	}

	private DisplaySkinTextures() {
		let items = AvatarCollectionManager.instance.GetAllAvatarSkins();
		if (items && items.size() > 0) {
			items.forEach((value) => {
				this.AddItemButton(value.ToString(), "", value.ToString(), () => {
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
			let accessoryBtn = newButton.GetAirshipComponent<AvatarAccessoryBtn>();
			if (accessoryBtn) {
				accessoryBtn.scrollRedirect.redirectTarget = this.contentScrollRect;
				accessoryBtn.SetBGColor(color);
				accessoryBtn.noColorChanges = true;
				// accessoryBtn.iconImage.color = color;
				accessoryBtn.labelText.enabled = false;
				this.currentContentBtns.push({ id: ColorUtil.ColorToHex(color), button: accessoryBtn });
			} else {
				error("Unable to find AvatarAccessoryBtn on color button");
			}
		} else {
			error("Missing item template or holder for items on AvatarEditor");
		}
	}

	private AddItemButton(classId: string, instanceId: string, itemName: string, onClickCallback: () => void) {
		if (this.itemButtonTemplate && this.mainContentHolder) {
			//let newButton = PoolManager.SpawnObject(this.itemButtonTemplate, this.mainContentHolder);
			let newButton = Object.Instantiate(this.itemButtonTemplate, this.mainContentHolder);
			let eventIndex = CanvasAPI.OnClickEvent(newButton, onClickCallback);
			this.itemButtonBin.Add(() => {
				Bridge.DisconnectEvent(eventIndex);
			});

			let accessoryBtn = newButton.GetAirshipComponent<AvatarAccessoryBtn>();
			if (accessoryBtn) {
				accessoryBtn.scrollRedirect.redirectTarget = this.contentScrollRect;
				accessoryBtn.classId = classId;
				accessoryBtn.instanceId = instanceId;
				accessoryBtn.SetText(itemName);
				accessoryBtn.noColorChanges = false;
				//TODO: Removed the image until we can load it from the server
				accessoryBtn.iconImage.enabled = false;
				this.currentContentBtns.push({ id: instanceId, button: accessoryBtn });

				//download the items thumbnail
				let cloudImage = newButton.gameObject.GetComponent<CloudImage>()!;
				if (cloudImage === undefined) {
					cloudImage = newButton.gameObject.AddComponent<CloudImage>();
				}
				cloudImage.downloadOnStart = false;
				cloudImage.image = accessoryBtn.iconImage;
				cloudImage.url = AvatarCollectionManager.instance.GetClassThumbnailUrl(classId);

				const downloadConn = cloudImage.OnFinishedLoading.Connect((success) => {
					if (success) {
						cloudImage.image.enabled = true;
						cloudImage.image.color = new Color(1, 1, 1, 1);
						if (accessoryBtn) {
							accessoryBtn.labelText.enabled = false;
						}
					}
				});
				this.bin.Add(() => {
					downloadConn.Disconnect();
				});

				//print("Downloading: " + cloudImage.url);
				cloudImage.StartDownload();
				return accessoryBtn;
			} else {
				error("Unable to find AvatarMenuBtn on item button");
			}
		} else {
			error("Missing item template or holder for items on AvatarEditor");
		}
	}

	private SetDirty(val: boolean): void {
		if (Game.IsMobile()) {
			if (val) {
				task.delay(0, () => {
					this.Save();
				});
			}
			return;
		}
		this.dirty = val;
		if (this.saveBtn) {
			this.saveBtn.SetDisabled(!val);
		}
		if (this.revertBtn) {
			this.revertBtn.SetDisabled(!val);
		}
	}

	private SelectItem(instanceId: string, accTemplate?: AccessoryComponent, instantRefresh = true) {
		if (!accTemplate) {
			return;
		}
		const alreadySelected = this.activeAccessories.get(accTemplate.GetSlotNumber()) === instanceId;
		this.RemoveItem(accTemplate.GetSlotNumber(), instantRefresh);
		if (alreadySelected) {
			//Already selected this item so just deselect it
			this.UpdateButtonGraphics();
			return;
		}
		this.Log("Selecting item: " + accTemplate.ToString());
		let acc = this.mainMenu?.avatarView?.accessoryBuilder?.AddSingleAccessory(accTemplate, instantRefresh);
		acc?.AccessoryComponent.SetInstanceId(instanceId);
		this.mainMenu?.avatarView?.PlayReaction(acc?.AccessoryComponent.accessorySlot ?? AccessorySlot.Root);
		this.activeAccessories.set(accTemplate.GetSlotNumber(), instanceId);
		this.selectedAccessories.set(instanceId, true);
		this.UpdateButtonGraphics();
		this.SetDirty(true);

		//Make these objects not use baked lighting settings
		if (acc) {
			for (let i = 0; i < acc.renderers.Length; i++) {
				let ren = acc.renderers.GetValue(i);
				if (ren) {
					ren.lightProbeUsage = LightProbeUsage.CustomProvided;
				}
			}
		}
	}

	private SelectFaceItem(face: AccessoryFace, instantRefresh = true) {
		if (!face) {
			print("Missing face item: " + face);
			return;
		}
		const accBuilder = this.mainMenu?.avatarView?.accessoryBuilder;
		this.mainMenu?.avatarView?.accessoryBuilder?.SetFaceTexture(face.decalTexture);
		this.selectedFaceId = face.serverInstanceId;
		this.UpdateButtonGraphics();
		this.SetDirty(true);
	}

	private SelectSkinItem(acc: AccessorySkin, instantRefresh = true) {
		if (!acc) {
			return;
		}
		this.Log("Selecting skin item: " + acc.ToString());
		this.mainMenu?.avatarView?.accessoryBuilder?.AddSkinAccessory(acc, instantRefresh);
		this.SetDirty(true);
	}

	private SelectSkinColor(color: Color, instantRefresh = true) {
		this.Log("Selecting Color: " + color);
		this.mainMenu?.avatarView?.accessoryBuilder?.SetSkinColor(color, instantRefresh);
		this.mainMenu?.avatarView?.PlayReaction(AccessorySlot.Root);
		this.selectedColor = ColorUtil.ColorToHex(color);
		this.UpdateButtonGraphics();
		this.SetDirty(true);
	}

	private RemoveItem(slot: AccessorySlot, instantRefresh = true) {
		this.mainMenu?.avatarView?.accessoryBuilder?.RemoveAccessorySlot(slot, instantRefresh);
		let instanceId = this.activeAccessories.get(slot);
		if (instanceId && instanceId !== "") {
			this.selectedAccessories.delete(instanceId);
		}
		this.activeAccessories.set(slot, "");
	}

	private OnDragAvatar(down: boolean) {
		if (this.mainMenu?.avatarView) {
			this.mainMenu.avatarView.dragging = down;
		}
	}

	private LoadAllOutfits() {
		this.Log("LoadAllOutfits");
		AvatarPlatformAPI.GetAllOutfits().then((outfits) => {
			this.outfits = outfits;
			const outfitSize = this.outfits ? this.outfits.size() : 0;
			if (outfitSize <= 0) {
				warn("No outfits exist on user");
			}

			if (this.outfitBtns) {
				for (let i = 0; i < this.outfitBtns.size(); i++) {
					// Disable Outfit buttons that we don't need
					if (i >= outfitSize) {
						this.outfitBtns[i].gameObject.SetActive(false);
					} else if (outfits) {
						const outfit = outfits[i];
						if (outfit.name.match("Default%d+")[0]) continue;

						// Set name on outfits
						const nameComp =
							this.outfitBtns[i].gameObject.GetAirshipComponentInChildren<OutfitButtonNameComponent>();
						if (!nameComp) continue;

						nameComp.UpdateDisplayName(outfit.name);
					}
				}
			}

			AvatarPlatformAPI.GetEquippedOutfit().then((equippedOutfit) => {
				if (equippedOutfit && this.outfits) {
					let i = 0;
					for (let outfit of this.outfits) {
						if (outfit.outfitId === equippedOutfit.outfitId) {
							//Select equipped outfit
							this.Log("Found default outfit index: " + i);
							this.SelectOutfit(i, false);
							return;
						}
						i++;
					}
				}

				//Select the first outfit if no outfit was found
				this.SelectOutfit(0, false);
			});
		});
	}

	private SelectOutfit(index: number, notifyServer: boolean = true) {
		this.Log("SelectOutfit: " + index);

		if (!this.outfits || index < 0 || index >= this.outfits.size() || this.inThumbnailMode) {
			error(`Index ${index} out of range of outfits`);
		}
		this.currentUserOutfitIndex = index;
		for (let i = 0; i < this.outfitBtns.size(); i++) {
			this.outfitBtns[i].SetSelected(i === index);
		}
		this.currentUserOutfit = this.outfits[index];
		if (notifyServer) {
			AvatarPlatformAPI.EquipAvatarOutfit(this.currentUserOutfit.outfitId).then(() => {
				if (Game.coreContext === CoreContext.GAME) {
					CoreNetwork.ClientToServer.ChangedOutfit.client.FireServer();
				}
			});
		}

		this.LoadCurrentOutfit();
	}

	public RenameOutfit(index: number, newName: string) {
		this.Log("RenameOutfit: " + index);
		if (!this.outfits || index < 0 || index >= this.outfits.size() || this.inThumbnailMode) {
			error(`Index ${index} out of range of outfits`);
		}

		const relevantOutfit = this.outfits[index];
		if (relevantOutfit.name === newName) return;

		AvatarPlatformAPI.RenameOutfit(relevantOutfit.outfitId, newName).catch((e) => {
			print("Failed to rename outfit.");
			print(e);
		});
	}

	private ClearAllAccessories() {
		this.mainMenu?.avatarView?.accessoryBuilder?.RemoveAllAccessories(true);
		this.selectedAccessories.clear();
		this.activeAccessories.clear();
	}

	private LoadCurrentOutfit() {
		if (!this.currentUserOutfit) {
			return;
		}
		this.Log("Loading outfit: " + this.currentUserOutfit.name);
		this.ClearAllAccessories();

		this.currentUserOutfit.accessories.forEach((acc, index) => {
			this.Log("Outfit acc: " + acc.class.name + ": " + acc.class.classId);
			let accComponent = AvatarCollectionManager.instance.GetAccessoryFromClassId(acc.class.classId);
			if (accComponent) {
				this.SelectItem(acc.instanceId, accComponent, false);
			} else {
				let face = AvatarCollectionManager.instance.GetAccessoryFaceFromClassId(acc.class.classId);
				if (face) {
					this.SelectFaceItem(face, false);
				}
			}
		});

		this.SelectSkinColor(ColorUtil.HexToColor(this.currentUserOutfit.skinColor), true);

		this.UpdateButtonGraphics();
		this.SetDirty(false);
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
				this.selectedFaceId === button.id;
			button.button.SetSelected(active);
		}
	}

	private Save() {
		if (this.inThumbnailMode) {
			this.RenderThumbnails();
			return;
		}

		if (!this.currentUserOutfit) {
			warn("Trying to save with no outfit selected!");
			return;
		}
		// if (this.saveBtn) {
		// 	this.saveBtn.interactable = false;
		// }
		let accBuilder = this.mainMenu?.avatarView?.accessoryBuilder;
		let accessoryIds: string[] = [];
		if (accBuilder) {
			for (const [key, value] of this.selectedAccessories) {
				const instanceId = key;
				if (instanceId === "") {
					warn("Trying to save avatar accessory without a proper instance ID");
					continue;
				}
				accessoryIds.push(instanceId);
			}
			accessoryIds.push(this.selectedFaceId);
		}

		AvatarPlatformAPI.SaveOutfitAccessories(this.currentUserOutfit.outfitId, this.selectedColor, accessoryIds).then(
			(value) => {
				this.currentUserOutfit = value;
				if (this.outfits && this.currentUserOutfit) {
					this.outfits[this.currentUserOutfitIndex] = this.currentUserOutfit;
				}
				if (Game.coreContext === CoreContext.GAME) {
					CoreNetwork.ClientToServer.ChangedOutfit.client.FireServer();
				}
			},
		);

		this.SetDirty(false);
	}

	private Revert() {
		this.LoadCurrentOutfit();
	}

	private thumbnailRenderList: Map<string, { accesory: AccessoryComponent; button: AvatarAccessoryBtn }> = new Map();
	private thumbnailFaceRenderList: Map<string, { accesory: AccessoryFace; button: AvatarAccessoryBtn }> = new Map();
	private inThumbnailMode = false;
	private renderSetup?: AvatarRenderComponent;
	/**
	 * Internal use only`.
	 *
	 * @internal
	 */
	public EnterThumbnailMode() {
		if (!this.renderSetup) {
			this.renderSetup = this.mainMenu?.avatarView?.CreateRenderScene();
		}
		print("Entering Thumbnail Mode");
		this.mainMenu?.avatarView?.backdropHolder?.gameObject.SetActive(false);
		this.inThumbnailMode = true;
		this.SetDirty(true);
		this.ClearItembuttons();
		this.ClearAllAccessories();
		//Accessories
		let foundItems = AvatarCollectionManager.instance.GetAllPossibleAvatarItems();
		let foundFaces = AvatarCollectionManager.instance.GetAllAvatarFaceItems();
		if (foundItems) {
			let allItems: { instanceId: string; item: AccessoryComponent }[] = [];
			for (let [key, value] of foundItems) {
				if (value && value.GetServerClassId() !== undefined && value.GetServerClassId() !== "") {
					let button = this.AddItemButton(
						value.GetServerClassId(),
						value.GetServerClassId(),
						value.name,
						() => {
							const alreadySelected = this.thumbnailRenderList
								.get(value.GetServerClassId())
								?.button.GetSelected();
							this.Log("Selecting item: " + value.ToString() + ": " + alreadySelected);
							this.thumbnailRenderList
								.get(value.GetServerClassId())
								?.button.SetSelected(!alreadySelected);
						},
					);
					button.SetSelected(false);
					this.thumbnailRenderList.set(value.GetServerClassId(), { accesory: value, button: button });
				}
			}
			for (let value of foundFaces) {
				if (value && value.GetServerClassId() !== undefined && value.GetServerClassId() !== "") {
					let button = this.AddItemButton(
						value.GetServerClassId(),
						value.GetServerClassId(),
						value.name,
						() => {
							const alreadySelected = this.thumbnailFaceRenderList
								.get(value.GetServerClassId())
								?.button.GetSelected();
							this.Log("Selecting face: " + value.ToString() + ": " + alreadySelected);
							this.thumbnailFaceRenderList
								.get(value.GetServerClassId())
								?.button.SetSelected(!alreadySelected);
						},
					);
					button.SetSelected(false);
					this.thumbnailFaceRenderList.set(value.GetServerClassId(), { accesory: value, button: button });
				}
			}
			this.DisplayItems(allItems);
		}
		this.currentFocusedSlot = AccessorySlot.Root;
		this.mainMenu?.avatarView?.CameraFocusSlot(this.currentFocusedSlot);
	}

	/**
	 * Internal use only`.
	 *
	 * @internal
	 */
	public LeaveThumbnailMode() {
		print("Leaving Thumbnail Mode");
		if (this.renderSetup) {
			Object.Destroy(this.renderSetup);
		}
		this.ClearItembuttons();
		this.thumbnailRenderList.clear();
		this.mainMenu?.avatarView?.backdropHolder?.gameObject.SetActive(true);
		this.OpenPage();
	}

	/**
	 * Internal use only`.
	 *
	 * @internal
	 */
	private RenderThumbnails() {
		if (!this.renderSetup) {
			return;
		}

		this.renderSetup.uploadThumbnails = true;
		if (Airship.Input.IsDown(CoreAction.Sprint)) {
			print("Rendering All Items");
			this.renderSetup.RenderAllItems();
		} else {
			print("Rendering Selected Items");
			this.renderSetup.CreateItemCamera();
			this.renderSetup?.SetupForRenders(false);
			for (let [key, value] of this.thumbnailRenderList) {
				if (value && value.button.GetSelected()) {
					this.renderSetup?.RenderItem(value.accesory);
				}
			}
			this.renderSetup?.SetupForRenders(true);
			for (let [key, value] of this.thumbnailFaceRenderList) {
				if (value && value.button.GetSelected()) {
					this.renderSetup?.RenderFace(value.accesory);
				}
			}
		}
	}
}
