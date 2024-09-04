import { Airship } from "@Easy/Core/Shared/Airship";
import Inventory from "@Easy/Core/Shared/Inventory/Inventory";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { Keyboard, Mouse } from "@Easy/Core/Shared/UserInput";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { OnUpdate } from "@Easy/Core/Shared/Util/Timer";
import { Asset } from "../Asset";
import AirshipInventoryTile from "./AirshipInventoryTile";

type DraggingState = {
	inventory: Inventory;
	itemStack: ItemStack;
	slot: number;
	transform: RectTransform;
	consumed: boolean;
};

export default class AirshipInventoryUI extends AirshipBehaviour {
	@Header("Variables")
	public darkBackground = true;

	@Header("Hotbar")
	public hotbarCanvas!: Canvas;
	public hotbarContent!: RectTransform;
	public hotbarTileTemplate!: GameObject;

	@Header("Backpack")
	public backpackCanvas!: Canvas;
	public backpackContent!: RectTransform;
	public backpackTileTemplate!: GameObject;

	@Header("Backpack (Hotbar Row)")
	@Tooltip("The hotbar content that is displayed when backpack is open.")
	public backpackHotbarContent!: RectTransform;
	public backpackHotbarTileTemplate!: GameObject;

	// public onDropOutsideInventory = new Signal<[slot: number, itemStack: ItemStack]>();

	// private hotbarSlots = 9;
	private backpackShown = false;

	// private healthBar: Healthbar;
	// private inventoryRefs: GameObjectReferences;

	private slotToBackpackTileMap = new Map<number, GameObject>();

	private enabled = true;
	private visible = false;
	private backpackEnabled = true;

	@NonSerialized() public draggingState: DraggingState | undefined;
	private draggingBin = new Bin();
	private spriteCacheForItemType = new Map<string, Sprite>();

	private isSetup = false;

	override Awake() {
		this.hotbarCanvas.enabled = false;
		this.backpackCanvas.enabled = false;
	}

	override Start(): void {
		Airship.Inventory.ObserveLocalInventory((inv) => {
			if (this.isSetup) return;

			this.isSetup = true;
			this.SetupHotbar();
			this.SetupBackpack();
		});
		Airship.Input.OnDown("Inventory").Connect((event) => {
			if (event.uiProcessed || !this.enabled || !this.isSetup) return;
			if (this.IsBackpackShown() || AppManager.IsOpen()) {
				AppManager.Close();
			} else {
				this.OpenBackpack();
			}
		});
	}

	public SetHealtbarVisible(visible: boolean) {
		// this.healthBar.transform.gameObject.SetActive(visible);
	}

	public SetHotbarVisible(visible: boolean) {
		this.hotbarContent.gameObject.SetActive(visible);
	}

	public SetBackpackVisible(visible: boolean) {
		this.backpackEnabled = this.visible;
		if (!visible) {
			if (this.IsBackpackShown() || AppManager.IsOpen()) {
				AppManager.Close();
			}
		}
	}

	public OpenBackpack(): void {
		if (!this.enabled || !this.backpackEnabled) return;

		this.backpackShown = true;

		const wrapper = this.backpackCanvas.transform.GetChild(0).GetComponent<RectTransform>()!;
		wrapper.anchoredPosition = new Vector2(0, -20);
		NativeTween.AnchoredPositionY(wrapper, 0, 0.12);

		this.hotbarCanvas.enabled = false;

		AppManager.OpenCanvas(this.backpackCanvas, {
			onClose: () => {
				this.backpackShown = false;
				this.hotbarCanvas.enabled = true;
			},
			noDarkBackground: this.darkBackground === false,
		});
	}

	private SetupHotbar(): void {
		this.hotbarCanvas.enabled = true;

		const inv = Airship.Inventory.localInventory!;
		for (let i = 0; i < inv.hotbarSlots; i++) {
			this.UpdateHotbarSlot(i, inv.GetHeldSlot() ?? 0, undefined, true);
		}

		let init = false;
		Airship.Inventory.ObserveLocalInventory((inv) => {
			const invBin = new Bin();
			const slotBinMap = new Map<number, Bin>();
			invBin.Add(
				inv.onSlotChanged.Connect((slot, itemStack) => {
					slotBinMap.get(slot)?.Clean();
					if (slot < inv.hotbarSlots) {
						const slotBin = new Bin();
						slotBinMap.set(slot, slotBin);

						this.UpdateHotbarSlot(slot, inv.GetHeldSlot(), itemStack);

						if (itemStack) {
							slotBin.Add(
								itemStack.amountChanged.Connect((e) => {
									this.UpdateHotbarSlot(slot, inv.GetHeldSlot(), itemStack);
								}),
							);
							slotBin.Add(
								itemStack.itemTypeChanged.Connect((e) => {
									this.UpdateHotbarSlot(slot, inv.GetHeldSlot(), itemStack);
								}),
							);
						}
					}
				}),
			);

			invBin.Add(() => {
				for (const pair of slotBinMap) {
					pair[1].Clean();
				}
				slotBinMap.clear();
			});

			invBin.Add(
				inv.onHeldSlotChanged.Connect((slot) => {
					for (let i = 0; i < inv.hotbarSlots; i++) {
						const itemStack = inv.GetItem(i);
						this.UpdateHotbarSlot(i, slot, itemStack);
					}
					this.prevHeldSlot = slot;
				}),
			);

			for (let i = 0; i < inv.hotbarSlots; i++) {
				const itemStack = inv.GetItem(i);
				this.UpdateHotbarSlot(i, inv.GetHeldSlot(), itemStack, init, true);
			}
			this.prevHeldSlot = inv.GetHeldSlot();
			init = false;

			return () => {
				invBin.Clean();
			};
		});

		// Healthbar
		// Game.localPlayer.ObserveCharacter((character) => {
		// 	const bin = new Bin();

		// 	if (character === undefined) {
		// 		if (!this.firstSpawn) this.healthBar.SetValue(0);
		// 		if (this.firstSpawn) this.firstSpawn = false;

		// 		if (this.enabled) this.SetVisible(false);

		// 		// this.healthBar.transform.gameObject.SetActive(false);
		// 		// this.SetEnabled(false);
		// 		return;
		// 	}
		// 	if (this.enabled) this.SetVisible(true);
		// 	// this.healthBar.transform.gameObject.SetActive(true);

		// 	const SetFill = (newHealth: number, instant: boolean) => {
		// 		let fill = newHealth / character.GetMaxHealth();
		// 		if (instant) {
		// 			this.healthBar.InstantlySetValue(fill);
		// 		} else {
		// 			this.healthBar.SetValue(fill);
		// 		}
		// 	};
		// 	SetFill(character.GetHealth(), false);
		// 	bin.Add(
		// 		character.onHealthChanged.Connect((h) => {
		// 			SetFill(h, false);
		// 		}),
		// 	);
		// 	return () => {
		// 		bin.Clean();
		// 	};
		// });
	}

	private UpdateTile(tile: GameObject, slot: number, itemStack: ItemStack | undefined): void {
		const inv = Airship.Inventory.localInventory;

		const tileComponent = tile.GetAirshipComponent<AirshipInventoryTile>();
		if (!tileComponent) {
			error("Missing AirshipInventoryTile component when updating inventory tile: " + tile.name);
		}

		if (tileComponent.slotNumberText !== undefined) {
			if (slot !== undefined && slot < inv!.hotbarSlots) {
				tileComponent.slotNumberText.text = `${slot + 1}`;
			} else {
				tileComponent.slotNumberText.text = "";
			}
		}

		if (!itemStack) {
			tileComponent.itemImage.enabled = false;
			tileComponent.itemAmount.enabled = false;
			tileComponent.itemName.enabled = false;
			return;
		}

		const itemType = itemStack.itemType;
		let imageSrc = itemStack.itemDef.image;
		let texture2d: Texture2D | undefined;
		if (imageSrc) {
			texture2d = Asset.LoadAssetIfExists<Texture2D>(imageSrc);
		}
		if (texture2d) {
			let cachedSprite = this.spriteCacheForItemType.get(itemStack.itemDef.itemType);
			if (!cachedSprite) {
				cachedSprite = Bridge.MakeSprite(texture2d);
				this.spriteCacheForItemType.set(itemType, cachedSprite);
			}
			tileComponent.itemImage.sprite = cachedSprite;
			tileComponent.itemImage.enabled = true;
			tileComponent.itemName.enabled = false;
		} else {
			tileComponent.itemName.text = itemStack.itemDef.displayName;
			tileComponent.itemName.enabled = true;
			tileComponent.itemImage.enabled = false;
		}

		tileComponent.itemAmount.enabled = true;
		if (itemStack.amount > 1) {
			tileComponent.itemAmount.text = itemStack.amount + "";
		} else {
			tileComponent.itemAmount.text = "";
		}
	}

	private prevHeldSlot = -2;
	private UpdateHotbarSlot(
		slot: number,
		selectedSlot: number,
		itemStack: ItemStack | undefined,
		init = false,
		reset = false,
	): void {
		let go: GameObject;
		if (slot >= this.hotbarContent.childCount) {
			go = Object.Instantiate(this.hotbarTileTemplate, this.hotbarContent);
		} else {
			go = this.hotbarContent.GetChild(slot).gameObject;
		}

		this.UpdateTile(go, slot, itemStack);

		const contentGO = go.transform.GetChild(0).gameObject;
		const contentRect = contentGO.GetComponent<RectTransform>()!;
		if (selectedSlot === slot && (this.prevHeldSlot !== slot || reset)) {
			NativeTween.AnchoredPositionY(contentRect, 10, 0.1);
		} else if (selectedSlot !== slot && (this.prevHeldSlot === slot || reset)) {
			NativeTween.AnchoredPositionY(contentRect, 0, 0.1);
		}

		if (init) {
			const tileComponent = go.GetAirshipComponent<AirshipInventoryTile>()!;
			CanvasAPI.OnClickEvent(tileComponent.button.gameObject, () => {
				Airship.Inventory.localInventory?.SetHeldSlot(slot);
			});
		}
	}

	private SetupBackpack(): void {
		const inv = Airship.Inventory.localInventory!;

		// backpack hotbar slots
		const backpackHotbarContentChildCount = this.backpackHotbarContent.childCount;
		for (let i = 0; i < inv.hotbarSlots; i++) {
			let tileGO: GameObject;
			if (i >= backpackHotbarContentChildCount) {
				tileGO = Object.Instantiate(this.backpackHotbarTileTemplate, this.backpackHotbarContent);
			} else {
				tileGO = this.backpackHotbarContent.GetChild(i).gameObject;
			}
			this.slotToBackpackTileMap.set(i, tileGO);
		}

		// backpack slots
		const backpackContentChildCount = this.backpackContent.childCount;
		for (let i = 0; i < inv.maxSlots - inv.hotbarSlots; i++) {
			let tileGO: GameObject;
			if (i >= backpackContentChildCount) {
				tileGO = Object.Instantiate(this.backpackTileTemplate, this.backpackContent);
			} else {
				tileGO = this.backpackContent.GetChild(i).gameObject;
			}
			this.slotToBackpackTileMap.set(i + inv.hotbarSlots, tileGO);
		}

		const invBin = new Bin();
		let init = true;
		Airship.Inventory.ObserveLocalInventory((inv) => {
			invBin.Clean();
			const slotBinMap = new Map<number, Bin>();

			inv.onSlotChanged.Connect((slot, itemStack) => {
				slotBinMap.get(slot)?.Clean();
				const slotBin = new Bin();
				slotBinMap.set(slot, slotBin);

				const tile = this.slotToBackpackTileMap.get(slot)!;
				this.UpdateTile(tile, slot, itemStack);

				if (itemStack) {
					slotBin.Add(
						itemStack.amountChanged.Connect((e) => {
							this.UpdateTile(tile, slot, itemStack);
						}),
					);
					slotBin.Add(
						itemStack.itemTypeChanged.Connect((e) => {
							this.UpdateTile(tile, slot, itemStack);
						}),
					);
				}
			});
			invBin.Add(() => {
				for (const pair of slotBinMap) {
					pair[1].Clean();
				}
				slotBinMap.clear();
			});

			// Setup connections
			for (let i = 0; i < inv.GetMaxSlots(); i++) {
				const tile = this.slotToBackpackTileMap.get(i)!;
				this.UpdateTile(tile, i, inv.GetItem(i));

				// Prevent listening to connections multiple times
				if (init) {
					const tileComponent = tile.GetAirshipComponent<AirshipInventoryTile>()!;
					CanvasAPI.OnClickEvent(tileComponent.button.gameObject, () => {
						if (i < inv.hotbarSlots) {
							// hotbar
							if (this.IsBackpackShown()) {
								if (Keyboard.IsKeyDown(Key.LeftShift)) {
									Airship.Inventory.QuickMoveSlot(inv, i);
								}
							} else {
								inv.SetHeldSlot(i);
							}
						} else {
							// backpack
							if (Keyboard.IsKeyDown(Key.LeftShift)) {
								Airship.Inventory.QuickMoveSlot(inv, i);
							}
						}
					});
					CanvasAPI.OnBeginDragEvent(tileComponent.button.gameObject, () => {
						this.draggingBin.Clean();
						if (!this.IsBackpackShown()) return;
						if (Keyboard.IsKeyDown(Key.LeftShift)) return;

						if (!Airship.Inventory.localInventory) return;
						const itemStack = Airship.Inventory.localInventory.GetItem(i);
						if (!itemStack) return;

						const visual = tileComponent.button.transform.GetChild(0).gameObject;
						const clone = Object.Instantiate(visual, this.backpackCanvas.transform);

						const slotNumber = clone.transform.Find("SlotNumber");
						slotNumber?.gameObject.SetActive(false);

						clone.transform.SetAsLastSibling();

						const cloneRect = clone.GetComponent<RectTransform>()!;
						cloneRect.sizeDelta = new Vector2(100, 100);
						const cloneImage = clone.transform.GetChild(0).GetComponent<Image>()!;
						cloneImage.raycastTarget = false;

						visual.SetActive(false);

						const cloneTransform = clone.GetComponent<RectTransform>()!;
						cloneTransform.position = Mouse.GetPositionVector3();

						this.draggingBin.Add(
							OnUpdate.Connect((dt) => {
								cloneTransform.position = Mouse.GetPositionVector3();
							}),
						);
						this.draggingBin.Add(() => {
							visual.SetActive(true);
						});

						this.draggingState = {
							slot: i,
							itemStack,
							inventory: Airship.Inventory.localInventory,
							transform: cloneTransform,
							consumed: false,
						};
					});

					// Called before end
					CanvasAPI.OnDropEvent(tileComponent.button.gameObject, () => {
						if (!this.IsBackpackShown()) return;
						if (!this.draggingState) return;
						if (!Airship.Inventory.localInventory) return;

						Airship.Inventory.MoveToSlot(
							this.draggingState.inventory,
							this.draggingState.slot,
							Airship.Inventory.localInventory,
							i,
							this.draggingState.itemStack.amount,
						);
						this.draggingState.consumed = true;
					});

					// Called after drop
					CanvasAPI.OnEndDragEvent(tileComponent.button.gameObject, () => {
						this.draggingBin.Clean();

						if (this.draggingState) {
							if (!this.draggingState.consumed) {
								// Intent may be to drop item
								// this.characterInvController.DropItemInSlot(
								// 	this.draggingState.slot,
								// 	this.draggingState.itemStack.amount,
								// );
							}

							Object.Destroy(this.draggingState.transform.gameObject);
							this.draggingState = undefined;
						}
					});
				}
			}
			init = false;
		});
	}

	public IsBackpackShown(): boolean {
		return this.backpackShown;
	}
}
