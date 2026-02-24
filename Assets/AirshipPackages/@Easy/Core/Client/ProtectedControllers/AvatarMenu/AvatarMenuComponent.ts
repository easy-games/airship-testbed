import { Airship } from "@Easy/Core/Shared/Airship";
import {
	AirshipGearCategory,
	AirshipGearItem,
	AirshipOutfit,
} from "@Easy/Core/Shared/Airship/Types/AirshipPlatformInventory";
import AvatarViewComponent from "@Easy/Core/Shared/Avatar/AvatarViewComponent";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { EncodeJSON } from "@Easy/Core/Shared/json";
import AirshipButton from "@Easy/Core/Shared/MainMenu/Components/AirshipButton";
import { MainMenuSingleton } from "@Easy/Core/Shared/MainMenu/Singletons/MainMenuSingleton";
import { Protected } from "@Easy/Core/Shared/Protected";
import { Keyboard, Mouse } from "@Easy/Core/Shared/UserInput";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, PointerButton, PointerDirection } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import MainMenuPageComponent from "../../../Shared/MainMenu/Components/MainMenuPageComponent";
import { MainMenuController } from "../MainMenuController";
import { MainMenuPageType } from "../MainMenuPageName";
import { RightClickMenuController } from "../UI/RightClickMenu/RightClickMenuController";
import AvatarAccessoryBtn from "./AvatarAccessoryBtn";
import AvatarMenuBtn from "./AvatarMenuBtn";
import AvatarMenuProfileComponent from "./AvatarMenuProfileComponent";
import OutfitButton from "./Outfit/OutfitButtonComponent";
import OutfitButtonNameComponent from "./Outfit/OutfitButtonNameComponent";
import { Layer } from "@Easy/Core/Shared/Util/Layer";

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
	public mainContentHolder: Transform;
	public avatarProfileMenuGo?: GameObject;
	public avatarToolbar!: RectTransform;
	public avatarOptionsHolder!: RectTransform;
	public avatar3DHolder!: RectTransform;
	public contentScrollRect!: ScrollRect;
	public avatarLoadingContainer: RectTransform;
	public avatarLoadingContainerMobile: RectTransform;
	public gearLoadingIndicator: GameObject;

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

	@NonSerialized() private outfitBtns: AvatarMenuBtn[] = [];
	private mainNavBtns: AvatarMenuBtn[] = [];
	//private subNavBtns: AvatarMenuBtn[] = [];
	//private subBarBtns: AvatarMenuBtn[][] = [[]]; //Each sub category has its own list of buttons

	private activeMainIndex = -1;
	private activeSubIndex = -1;

    // All of the outfits accessories by slot
	private outfitAccessories = new Map<AccessorySlot, string>();
    // Just for easy lookup by acc id
	private outfitAccessoryLookup = new Set<string>();
	//private currentSlot: AccessorySlot = AccessorySlot.Root;
	private viewedOutfit?: AirshipOutfit;
	private currentUserOutfitIndex = -1;
	private currentContentBtns: { id: string; button: AvatarAccessoryBtn }[] = [];
	private clientId = -1;
	private selectedColor = "";
	private selectedFaceId = "";
	private bin: Bin = new Bin();
	private currentFocusedSlot: AccessorySlot = AccessorySlot.Root;
	private avatarProfileMenu?: AvatarMenuProfileComponent;
	private dirty = false;
	private hasMeshCombinedOnce = false;

	private discardTitle = "Discarding Changes!";
	private discardMessage = "Are you sure you want to discard changes to your outfit?";

	private accessoryBuilder!: AccessoryBuilder;

	private gearLoadingCounter = 0;
	private finishedFirstOutfitLoad = false;

	private Log(message: string) {
		//print("Avatar Editor: " + message + " (" + Time.time + ")");
	}

	override Init(mainMenu: MainMenuController, pageType: MainMenuPageType): void {
		super.Init(mainMenu, pageType);
		this.clientId = 9999; //Dependency<PlayerController>().clientId;

		this.mainNavBtns = this.mainNavButtonHolder.gameObject.GetAirshipComponentsInChildren<AvatarMenuBtn>();
		if (this.outfitButtonHolder) {
			this.outfitBtns = this.outfitButtonHolder.gameObject.GetAirshipComponentsInChildren<AvatarMenuBtn>();
		}
		this.avatarProfileMenu = this.avatarProfileMenuGo?.GetAirshipComponent<AvatarMenuProfileComponent>();
		this.avatarProfileMenu?.Init(mainMenu);

		// Remove any dummy content
		this.mainContentHolder.gameObject.ClearChildren();

		let i = 0;
		// Hookup Nav buttons
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

		// Hookup outfit buttons
		if (!this.IsPhoneMode()) {
			if (!this.outfitBtns) {
				error("Unable to find outfit btns on Avatar Editor Page");
			}
			for (i = 0; i < this.outfitBtns.size(); i++) {
				const outfitI = i;
				const go = this.outfitBtns[i].gameObject;

				const outfitButton = go.GetAirshipComponent<OutfitButton>();
				if (outfitButton) outfitButton.outfitIdx = i;

				// Left clicking an outfit
				CanvasAPI.OnClickEvent(go, () => {
					task.spawn(async () => {
						if (this.dirty) {
							const confirmedDiscard = await Dependency<MainMenuSingleton>().ShowConfirmModal(
								this.discardTitle,
								this.discardMessage,
							);
							if (confirmedDiscard) {
								this.DiscardChanges();
							}
							if (!confirmedDiscard) {
								return;
							}
						}

						this.SelectOutfit(outfitI);
					});
				});

				// Right clicking an outfit
				CanvasAPI.OnPointerEvent(go, (dir, btn) => {
					if (dir === PointerDirection.DOWN && btn === PointerButton.RIGHT) {
						Dependency<RightClickMenuController>().OpenRightClickMenu(
							Dependency<MainMenuController>().mainContentCanvas,
							Mouse.position,
							[
								{
									text: "Copy Outfit",
									onClick: () => {
										// Save whole DTO interface?
										Bridge.CopyToClipboard(EncodeJSON(Protected.Avatar.outfits[outfitI]));
										// let outfitStr = "";
										// for( const gear of Protected.Avatar.outfits[outfitI].gear) {
										//     outfitStr += gear.class.classId+",";
										// }
										// Bridge.CopyToClipboard(outfitStr);
										// this.Log("OUTFIT GEAR: " + outfitStr);
									},
								},
							],
						);
					}
				});
			}
		}

		// Hookup general buttons
		if (this.avatarInteractionBtn) {
			if (Game.IsMobile()) {
				CanvasAPI.OnPointerEvent(this.avatarInteractionBtn.gameObject, (dir) => {
					this.OnDragAvatar(dir === PointerDirection.DOWN);
				});
			} else {
				CanvasAPI.OnBeginDragEvent(this.avatarInteractionBtn.gameObject, () => {
					this.OnDragAvatar(true);
				});
				CanvasAPI.OnEndDragEvent(this.avatarInteractionBtn.gameObject, () => {
					this.OnDragAvatar(false);
				});
			}
		}

		if (this.saveBtn) {
			this.saveBtn.button.onClick.Connect(() => {
				this.Save();
			});
		}

		if (this.revertBtn) {
			this.revertBtn.button.onClick.Connect(() => {
				this.DiscardChanges();
			});
		}

		this.DestroyItemButtons();
	}

	private downloadedAccessories = false;

	override OpenPage(params?: unknown): void {
		super.OpenPage(params);

		this.bin.Add(Dependency<MainMenuSingleton>().partyCardModifier.Add({ hidden: true }));

		// Load the character
		if (this.mainMenu.avatarView === undefined) {
			if (this.IsPhoneMode()) {
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
		this.accessoryBuilder = this.mainMenu.avatarView.accessoryBuilder;

        // Force Avatar layer on all objects (For layers AccessoryBuilder doesn't modify like TransparentVFX)
        this.bin.Add(this.accessoryBuilder.OnAccessoryAdded.Connect((accessories)=> {
            for(const acc of accessories) {
                if(acc) {
                    for(const ren of acc.renderers) {
                        if(ren) {
                            ren.gameObject.layer = Layer.AVATAR_EDITOR;
                        }
                    }
                }
            }
        }));

		if (!this.downloadedAccessories) {
			this.downloadedAccessories = true;
			task.spawn(async () => {
				while (!Protected.Avatar.isInventoryLoaded) {
					task.wait();
				}
				this.LoadAllOutfits();
			});
		}
		this.SetDirty(false);

		const mainMenuSingleton = Dependency<MainMenuSingleton>();

		this.bin.Add(mainMenuSingleton.socialMenuModifier.Add({ hidden: true }));

		if (!this.hasMeshCombinedOnce) {
			const charTransform = this.mainMenu.avatarView?.humanEntityGo?.transform!;
			charTransform.localPosition = new Vector3(0, -200, 0);
			this.avatarLoadingContainer.gameObject.SetActive(true);
		}

		let rawImage = this.avatarRenderHolder?.GetComponent<RawImage>();
		if (rawImage) {
			rawImage.texture = mainMenuSingleton.avatarEditorRenderTexture;
			this.bin.Add(
				mainMenuSingleton.onAvatarEditorRenderTextureUpdated.Connect((texture) => {
					rawImage.texture = texture;
				}),
			);
		}

		if (!this.IsPhoneMode()) {
			this.bin.Add(
				Dependency<MainMenuController>().onBeforePageChange.Connect((event) => {
					if (this.dirty && event.oldPage === MainMenuPageType.Avatar) {
						const [success, confirmedDiscard] = Dependency<MainMenuSingleton>()
							.ShowConfirmModal(this.discardTitle, this.discardMessage, "Discard")
							.await();
						if (confirmedDiscard) {
							this.DiscardChanges();
						}
						if (success && !confirmedDiscard) {
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

		if (this.avatarRenderHolder) {
			this.avatarRenderHolder?.SetActive(true);
		} else {
			error("No avatar render veiew in avatar editor menu page");
		}
		this.mainMenu?.avatarView?.ShowAvatar();
		this.mainMenu?.ToggleGameBG(false);

		this.SelectMainNav(0);
		this.SelectSubNav(0);
	}

	override ClosePage(): void {
		super.ClosePage();
		this.bin.Clean();
		this.avatarRenderHolder?.SetActive(false);
		this.mainMenu?.ToggleGameBG(true);
		if (this.mainMenu?.avatarView) {
			this.mainMenu.avatarView.dragging = false;
		} else {
			// error("no 3D avatar to render in avatar editor");
		}
	}

	private IsPhoneMode() {
		if (!Game.IsMobile()) return false;
		return Game.deviceType === AirshipDeviceType.Phone;
	}

	private SelectMainNav(index: number) {
		if (this.activeMainIndex === index || !this.mainNavBtns) {
			return;
		}

		if (this.IsPhoneMode()) {
			const scaleFactor = Game.GetScaleFactor();
			const scaledWidth = Screen.width / scaleFactor;

			const isSkinColor = index === 0;
			const cellSize = this.CalculateCellSize(scaledWidth, isSkinColor);
			this.grid.cellSize = cellSize;
		}

		let i = 0;
		this.activeMainIndex = index;

		//Highlight this category button
		for (i = 0; i < this.mainNavBtns.size(); i++) {
			const nav = this.mainNavBtns[i];
			nav.SetSelected(i === index);
			if (i === index && this.categoryLabelTxt) {
				this.categoryLabelTxt.text =
					nav.gameObject.GetComponentsInChildren<TextMeshProUGUI>()[0].text ?? "No Category";
			}
		}

		this.SelectSubNav(0);
	}

	private SelectSubNav(subIndex: number) {
		this.activeSubIndex = subIndex;

		this.DestroyItemButtons();

		switch (this.activeMainIndex) {
			case 0:
				//SKIN COLOR
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
		//this.currentSlot = slot;

		//Accessories
		let validClothingItems = Protected.Avatar.ownedClothing.filter(
			(c) =>{
                if(c.class.gear.subcategory === undefined || c.class.gear.category === "FaceDecal") {
                    return false;
                }
                const accSlot = Protected.Avatar.GearClothingSubcategoryToSlot(c.class.gear.subcategory);
                if(accSlot === AccessorySlot.Root) {
                    warn("Invalid sub category on item: " + c.class.name);
                }
				return c.class.gear.category === AirshipGearCategory.Clothing &&
				accSlot === slot},
		);
		this.DisplayClothingItems(validClothingItems);
		this.currentFocusedSlot = slot;
		this.mainMenu?.avatarView?.CameraFocusSlot(slot);
	}

	private async DisplayClothingItems(clothing: AirshipGearItem[]) {
		// const ownedItems = await Platform.Client.Inventory.GetItems({ queryType: "tag", tags: ["Clothing"] });
		// for (let item of ownedItems) {
		// 	const clothing = Clothing.DownloadYielding(item.classId, "airId", "versionHash");
		// }

		if (clothing && clothing.size() > 0) {
			clothing.forEach((c) => {
				this.AddItemButton(c, async () => {
					this.Log(`Clicking ${c.class.name} (${c.class.classId})`);
					await this.SelectItem(c);
					this.accessoryBuilder.UpdateCombinedMesh();
				});
			});
		}
	}

	private DisplayFaceItems() {
		let faceItems = Protected.Avatar.ownedClothing.filter((clothing) => {
			return clothing.class.gear.category === AirshipGearCategory.FaceDecal;
		});
		if (faceItems) {
			faceItems.forEach((clothingDto) => {
				this.AddItemButton(clothingDto, async () => {
					await this.SelectFaceItem(clothingDto);
					this.accessoryBuilder.UpdateCombinedMesh();
				});
			});
		}
		this.mainMenu?.avatarView?.CameraFocusSlot(AccessorySlot.Face);
	}

	private itemButtonBin: Bin = new Bin();

	private DestroyItemButtons() {
		this.itemButtonBin.Clean();
		this.currentContentBtns.clear();
		this.mainContentHolder.gameObject.ClearChildren();
	}

	private DisplayColorScheme() {
		for (let color of Protected.Avatar.skinColors) {
			this.AddColorButton(ColorUtil.HexToColor(color));
		}
		this.UpdateButtonGraphics();
		this.mainMenu?.avatarView?.CameraFocusSlot(AccessorySlot.Root);
	}

	private AddColorButton(color: Color) {
		if (this.itemButtonTemplate && this.mainContentHolder) {
			let newButton = Object.Instantiate(this.itemButtonTemplate, this.mainContentHolder);
			let eventIndex = CanvasAPI.OnClickEvent(newButton, () => {
				//Skin Color
				this.SelectSkinColor(color);
				this.accessoryBuilder.UpdateCombinedMesh();
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

	private AddItemButton(clothingDto: AirshipGearItem, onClickCallback: () => void) {
		//let newButton = PoolManager.SpawnObject(this.itemButtonTemplate, this.mainContentHolder);
		const newButton = Object.Instantiate(this.itemButtonTemplate!, this.mainContentHolder!);
		const redirectScroll = newButton.GetComponent<AirshipRedirectScroll>();
		this.itemButtonBin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(newButton, () => {
				//Make sure we aren't scrolling
				if (redirectScroll?.isDragging) {
					return;
				}

				//Fire the buttons call to action
				task.spawn(() => {
					onClickCallback();
				});
			}),
		);

		const accessoryBtn = newButton.GetAirshipComponent<AvatarAccessoryBtn>()!;
		accessoryBtn.Init(clothingDto);
		accessoryBtn.scrollRedirect.redirectTarget = this.contentScrollRect;
		accessoryBtn.classId = clothingDto.class.classId;
		accessoryBtn.instanceId = clothingDto.instanceId;
		accessoryBtn.SetText(clothingDto.class.name);
		accessoryBtn.noColorChanges = false;
		//TODO: Removed the image until we can load it from the server
		accessoryBtn.iconImage.enabled = false;
		this.currentContentBtns.push({ id: clothingDto.instanceId, button: accessoryBtn });

		//download the items thumbnail
		let cloudImage = newButton.gameObject.GetComponent<CloudImage>()!;
		if (cloudImage === undefined) {
			cloudImage = newButton.gameObject.AddComponent<CloudImage>();
		}
		cloudImage.downloadOnStart = false;
		cloudImage.image = accessoryBtn.iconImage;

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

		// Wait a little bit for the layout to render/load before starting image downloads since we need
		// to read the desired pixel size post layout render. I think we only need to wait one frame for this, but
		// we'll wait little longer just in case.
		task.unscaledDelay(Time.fixedDeltaTime, () => {
			const adjustedHeight = cloudImage.image.GetPixelAdjustedRect().height * 1.5;
			let height = 432;
			if (adjustedHeight <= 288) height = 288;
			if (adjustedHeight <= 144) height = 144;
			cloudImage.url = Protected.Cache.ApplyHeightToUrl(
				`${AirshipUrl.CDN}/images/${clothingDto.class.imageId}.png`,
				height,
			);

			cloudImage.StartDownload();
		});

		return accessoryBtn;
	}

	private SetDirty(val: boolean): void {
		if (this.IsPhoneMode()) {
			if (val && this.finishedFirstOutfitLoad) {
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

	private async SelectItem(clothingDto: AirshipGearItem): Promise<void> {
		if (clothingDto.class.gear.airAssets.size() === 0 || !clothingDto.class.gear.subcategory) return;
		const slot = Protected.Avatar.GearClothingSubcategoryToSlot(clothingDto.class.gear.subcategory);

		const alreadySelected = this.outfitAccessories.get(slot) === clothingDto.instanceId;
		this.RemoveItem(slot);
		if (alreadySelected) {
			// Already selected this item so just deselect it
			this.UpdateButtonGraphics();
            this.SetDirty(true);
			return;
		}

		this.mainMenu?.avatarView?.PlayReaction(slot);
		this.outfitAccessories.set(slot, clothingDto.instanceId);
		this.outfitAccessoryLookup.add(clothingDto.instanceId);
		this.UpdateButtonGraphics();
		this.SetDirty(true);

		this.gearLoadingCounter++;
		try {
			const gear = PlatformGear.DownloadYielding(clothingDto.class.classId, clothingDto.class.gear.airAssets[0]);
			if (!gear) error("failed to download clothing.");
			if (gear?.accessoryPrefabs === undefined) error("empty accessory prefabs.");
			if (!this.outfitAccessoryLookup.has(clothingDto.instanceId)) {
				// Item downloaded after user selected a different item
				return;
			}
			for (let accessoryPrefab of gear.accessoryPrefabs) {
				this.accessoryBuilder.Add(accessoryPrefab);
			}
		} catch (err) {
			Debug.LogError(err);
		}
		this.gearLoadingCounter--;
	}

	protected Update(dt: number): void {
		this.gearLoadingIndicator.SetActive(
			this.gearLoadingCounter > 0 && !this.avatarLoadingContainer.gameObject.activeInHierarchy,
		);
	}

	private async SelectFaceItem(face: AirshipGearItem): Promise<void> {
		if (!face) {
			warn("Missing face item");
			return;
		}

		this.selectedFaceId = face.instanceId;
		this.UpdateButtonGraphics();
		this.SetDirty(true);

		if (face.class.gear.airAssets.size() === 0) return;

		this.gearLoadingCounter++;
		try {
			const clothing = PlatformGear.DownloadYielding(face.class.classId, face.class.gear.airAssets[0]);
			if (clothing?.face) {
				this.accessoryBuilder.SetFaceTexture(clothing.face.decalTexture);
				this.accessoryBuilder.UpdateCombinedMesh();
			}
		} catch (err) {
			Debug.LogError(err);
		}
		this.gearLoadingCounter--;
	}

	private SelectSkinColor(color: Color) {
		this.accessoryBuilder.SetSkinColor(color);
		this.mainMenu?.avatarView?.PlayReaction(AccessorySlot.Root);
		this.selectedColor = ColorUtil.ColorToHex(color);
		this.UpdateButtonGraphics();
		this.SetDirty(true);
	}

	private RemoveItem(slot: AccessorySlot) {
		this.mainMenu?.avatarView?.accessoryBuilder?.RemoveBySlot(slot);
		let instanceId = this.outfitAccessories.get(slot);
		if (instanceId && instanceId !== "") {
			this.outfitAccessoryLookup.delete(instanceId);
		}
		this.outfitAccessories.delete(slot);
	}

	private OnDragAvatar(down: boolean) {
		if (this.mainMenu?.avatarView) {
			this.mainMenu.avatarView.dragging = down;
		}
	}

	private LoadAllOutfits() {
		const outfitSize = Protected.Avatar.outfits.size();
		if (outfitSize <= 0) {
			warn("No outfits exist on user");
		}

		for (let i = 0; i < this.outfitBtns.size(); i++) {
			// Disable Outfit buttons that we don't need
			if (i >= outfitSize) {
				this.outfitBtns[i].gameObject.SetActive(false);
			} else {
				const outfit = Protected.Avatar.outfits[i];
				if (outfit.name.match("Default%d+")[0]) continue;

				// Set name on outfits
				const nameComp =
					this.outfitBtns[i].gameObject.GetAirshipComponentInChildren<OutfitButtonNameComponent>();
				if (!nameComp) continue;

				nameComp.UpdateDisplayName(outfit.name);
			}
		}

		if (Protected.Avatar.equippedOutfit) {
			let index = Protected.Avatar.outfits.indexOf(Protected.Avatar.equippedOutfit);
			if (index > -1) {
				this.SelectOutfit(index, false);
			} else {
				this.SelectOutfit(0, false);
			}
		} else {
			this.SelectOutfit(0, false);
		}
	}

	private SelectOutfit(index: number, notifyServer: boolean = true) {
		if (index < 0 || index >= Protected.Avatar.outfits.size()) {
			error(`Index ${index} out of range of outfits`);
		}
		this.currentUserOutfitIndex = index;
		for (let i = 0; i < this.outfitBtns.size(); i++) {
			this.outfitBtns[i].SetSelected(i === index);
		}
		this.viewedOutfit = Protected.Avatar.outfits[index];
		if (notifyServer) {
			Protected.Avatar.EquipAvatarOutfit(this.viewedOutfit.outfitId).then(() => {
				if (Game.coreContext === CoreContext.GAME) {
					CoreNetwork.ClientToServer.ChangedOutfit.client.FireServer();
				}
			});
		}

		this.LoadCurrentOutfit().expect();
	}

	public RenameOutfit(index: number, newName: string) {
		if (index < 0 || index >= Protected.Avatar.outfits.size()) {
			error(`Index ${index} out of range of outfits`);
		}

		const relevantOutfit = Protected.Avatar.outfits[index];
		if (relevantOutfit.name === newName) return;

		Protected.Avatar.RenameOutfit(relevantOutfit.outfitId, newName).catch((e) => {
			warn("Failed to rename outfit.");
			warn(e);
		});
	}

	private async LoadCurrentOutfit() {
		if (!this.viewedOutfit) {
			return;
		}

		const charTransform = this.mainMenu.avatarView?.humanEntityGo?.transform!;
		if (!this.hasMeshCombinedOnce) {
			this.accessoryBuilder.OnMeshCombined.Once(() => {
				charTransform.localPosition = Vector3.zero;
				this.avatarLoadingContainer.gameObject.SetActive(false);
				this.hasMeshCombinedOnce = true;
			});
		}

		this.SetDirty(false);
		Airship.Avatar.LoadOutfit(this.accessoryBuilder, this.viewedOutfit, {
			removeOldClothingAccessories: true,
		});

        // Grab active accessories from loaded outfit to display current status
		this.finishedFirstOutfitLoad = true;
		this.selectedColor = this.viewedOutfit.skinColor;
        this.outfitAccessories.clear();
        this.outfitAccessoryLookup.clear();
        for(const gear of this.viewedOutfit.gear) {
            if(gear.class.gear.subcategory) {
                const slot = Protected.Avatar.GearClothingSubcategoryToSlot(gear.class.gear.subcategory);
                if(this.outfitAccessories.has(slot)) {
                    // Ignore duplicate slots. That should not be possible
                    warn("Duplicate slot accessories in loaded outfit: " + slot);
                    continue;
                }
                if(gear.class.gear.category === "FaceDecal") {
                    this.selectedFaceId = gear.instanceId;
                } else {
                    this.outfitAccessories.set(slot, gear.instanceId);
                    this.outfitAccessoryLookup.add(gear.instanceId);
                }
            }
        }
		this.UpdateButtonGraphics();

        // Combine Mesh
        // this.accessoryBuilder.UpdateCombinedMesh();
	}

	private UpdateButtonGraphics() {
		//Highlight selected items
		for (let i = 0; i < this.currentContentBtns.size(); i++) {
			let button = this.currentContentBtns[i];
			//Found matching instance ID or this button is the active color
			let active =
				this.selectedColor === button.id ||
				this.outfitAccessoryLookup.has(this.currentContentBtns[i].id) ||
				this.selectedFaceId === button.id;
			button.button.SetSelected(active);
		}
	}

	private Save() {
		// if (this.inThumbnailMode) {
		// 	this.RenderThumbnails();
		// 	return;
		// }

		if (!this.viewedOutfit) {
			warn("Trying to save with no outfit selected!");
			return;
		}
		// if (this.saveBtn) {
		// 	this.saveBtn.interactable = false;
		// }
		let accBuilder = this.mainMenu?.avatarView?.accessoryBuilder;
        if(!accBuilder) {
            error("Unable to find accessory builder in avatar menu");
        }
		let accessoryIds: string[] = [];
        for (const instanceId of this.outfitAccessoryLookup) {
            if (instanceId === "") {
                warn("Trying to save avatar accessory without a proper instance ID");
                continue;
            }
            accessoryIds.push(instanceId);
        }
        if (this.selectedFaceId !== "") {
            accessoryIds.push(this.selectedFaceId);
        }

		Protected.Avatar.SaveOutfitAccessories(this.viewedOutfit.outfitId, this.selectedColor, accessoryIds).then(
			(value) => {
				this.viewedOutfit = value;
				if (Protected.Avatar.outfits && this.viewedOutfit) {
					Protected.Avatar.outfits[this.currentUserOutfitIndex] = this.viewedOutfit;
				}
				if (Game.coreContext === CoreContext.GAME) {
					CoreNetwork.ClientToServer.ChangedOutfit.client.FireServer();
				}
			},
		);

		this.SetDirty(false);
	}

	private CalculateCellSize(screenWidth: number, isSkinColor: boolean): Vector2 {
		// These numbers are based on the avatar mobile page prefab values
		const padding = 30;
		const spacing = 8;
		const defaultWidth = 120;
		const defaultHeight = isSkinColor ? 120 : 150;
		const minColumns = 3;

		const availableWidth = screenWidth - padding;
		// Use a minumum of 3 columns, but allow more on larger screens
		const columnsWithDefaultSize = math.floor((availableWidth + spacing) / (defaultWidth + spacing));
		const targetColumns = math.max(minColumns, columnsWithDefaultSize);

		// Calculate Width and height based on number of columns
		const cellWidth = (availableWidth - spacing * (targetColumns - 1)) / targetColumns;
		const finalCellWidth = math.floor(cellWidth);
		const aspectRatio = defaultHeight / defaultWidth;
		const finalCellHeight = math.floor(finalCellWidth * aspectRatio);

		return new Vector2(finalCellWidth, finalCellHeight);
	}

	private DiscardChanges() {
		this.LoadCurrentOutfit().expect();
	}
}
