import { Airship } from "@Easy/Core/Shared/Airship";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { Keyboard, Mouse } from "@Easy/Core/Shared/UserInput";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, PointerDirection } from "@Easy/Core/Shared/Util/CanvasAPI";
import { OnUpdate } from "@Easy/Core/Shared/Util/Timer";
import { Asset } from "../Asset";
import { Game } from "../Game";
import ProximityPrompt from "../Input/ProximityPrompts/ProximityPrompt";
import StringUtils from "../Types/StringUtil";
import { DraggingState } from "./AirshipDraggingState";
import AirshipInventoryTile from "./AirshipInventoryTile";
import Inventory from "./Inventory";
import { InventoryUIVisibility } from "./InventoryUIVisibility";
import {
	CancellableInventorySlotInteractionEvent,
	InventorySlotMouseClickEvent,
	SlotDragEndedEvent,
} from "./Signal/SlotInteractionEvent";

export default class AirshipInventoryUI extends AirshipBehaviour {
	@Header("Variables")
	public darkBackground = true;

	@Header("Hotbar")
	public hotbarCanvas!: Canvas;
	public hotbarContent!: RectTransform;
	public hotbarSlots = 9;

	@Header("Backpack")
	public backpackLabel?: TMP_Text;
	public backpackCanvas!: Canvas;
	public backpackContent!: RectTransform;
	public dropItemCatcher: RectTransform;

	@Header("External Inventory")
	@Tooltip("The content for the external inventory")
	public externalInventoryLabel?: TMP_Text;
	public externalInventoryContent?: RectTransform;

	@Header("Backpack (Hotbar Row)")
	@Tooltip("The hotbar content that is displayed when backpack is open.")
	public backpackHotbarContent!: RectTransform;
	public backpackHotbarTileTemplate!: GameObject;

	@Header("Prefabs")
	public hotbarTileTemplate!: GameObject;
	public backpackTileTemplate!: GameObject;
	public otherInventoryTileTemplate?: GameObject;

	// public onDropOutsideInventory = new Signal<[slot: number, itemStack: ItemStack]>();

	// private hotbarSlots = 9;
	private externalInventory?: Inventory;
	private backpackShown = false;

	// private healthBar: Healthbar;
	// private inventoryRefs: GameObjectReferences;

	private slotToBackpackTileMap = new Map<number, GameObject>();
	private slotToExternalInventoryTileMap = new Map<number, GameObject>();

	private inventoryEnabled = true;
	private visible = false;
	private backpackEnabled = true;

	@NonSerialized() public draggingState: DraggingState | undefined;
	private draggingBin = new Bin();
	private spriteCacheForItemType = new Map<string, Sprite>();

	private bin = new Bin();
	private backpackOpenBin = new Bin();

	private isSetup = false;

	override Awake() {
		this.hotbarCanvas.enabled = false;
		this.backpackCanvas.enabled = false;
	}

	override Start(): void {
		this.backpackLabel?.gameObject.SetActive(false);
		this.externalInventoryContent?.gameObject.SetActive(false);
		this.externalInventoryLabel?.gameObject.SetActive(false);

		Airship.Inventory.ObserveLocalInventory(() => {
			if (this.isSetup) return;

			this.isSetup = true;
			const hb = this.SetupHotbar();
			const bp = this.SetupBackpack();
			return () => {
				hb.Clean();
				bp.Clean();
			};
		});
		Airship.Input.OnDown("Inventory").Connect((event) => {
			if (event.uiProcessed || !this.inventoryEnabled || !this.isSetup) return;
			if (this.IsBackpackShown() || AppManager.IsOpen()) {
				AppManager.Close();
			} else {
				this.OpenBackpack();
			}
		});

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnDropEvent(this.dropItemCatcher.gameObject, (e) => {
				if (!this.draggingState) return;

				const drag = this.draggingState;
				drag.consumed = true;
				task.spawn(() => {
					Airship.Inventory.localInventory?.onDraggedOutsideInventory.Fire(drag);
				});
			}),
		);
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
		if (!this.inventoryEnabled || !this.backpackEnabled) return;
		if (Airship.Inventory.uiVisibility === InventoryUIVisibility.Never) return;

		this.backpackShown = true;

		const wrapper = this.backpackCanvas.transform.GetChild(0).GetComponent<RectTransform>()!;
		wrapper.anchoredPosition = new Vector2(0, -20);
		NativeTween.AnchoredPositionY(wrapper, 0, 0.12);

		this.hotbarCanvas.enabled = false;

		AppManager.OpenCanvas(this.backpackCanvas, {
			onClose: () => {
				this.backpackShown = false;
				this.hotbarCanvas.enabled = true;
				this.backpackOpenBin.Clean();
			},
			noDarkBackground: this.darkBackground === false,
		});
	}

	public OpenBackpackWithExternalInventory(inventory: Inventory, onComplete?: () => void) {
		const closed = this.SetupExternalInventory(inventory);
		if (!closed) return;

		if (onComplete) {
			this.backpackOpenBin.Add(onComplete);
		}
		this.backpackOpenBin.Add(closed);

		// Open the regular backpack plspls
		this.OpenBackpack();
	}

	public GetHotbarSlotCount(): number {
		return this.hotbarSlots;
	}

	private SetupHotbar(): Bin {
		this.hotbarCanvas.enabled = true;

		let init = false; // TODO: @luke why is this false to start with? It looks like it's only ever false, but it works?
		return Game.localPlayer.ObserveCharacter((character) => {
			if (!character) {
				return;
			}
			for (let i = 0; i < this.hotbarSlots; i++) {
				this.UpdateHotbarSlot(i, character.GetHeldSlot() ?? 0, undefined, true);
			}

			const invBin = new Bin();
			const slotBinMap = new Map<number, Bin>();
			invBin.Add(
				character.inventory.onSlotChanged.Connect((slot, itemStack) => {
					slotBinMap.get(slot)?.Clean();
					if (slot < this.hotbarSlots) {
						const slotBin = new Bin();
						slotBinMap.set(slot, slotBin);

						this.UpdateHotbarSlot(slot, character.GetHeldSlot(), itemStack);

						if (itemStack) {
							slotBin.Add(
								itemStack.amountChanged.Connect((e) => {
									this.UpdateHotbarSlot(slot, character.GetHeldSlot(), itemStack);
								}),
							);
							slotBin.Add(
								itemStack.itemTypeChanged.Connect((e) => {
									this.UpdateHotbarSlot(slot, character.GetHeldSlot(), itemStack);
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
				character.onHeldSlotChanged.Connect((slot) => {
					for (let i = 0; i < this.hotbarSlots; i++) {
						const itemStack = character.inventory.GetItem(i);

						this.UpdateHotbarSlot(i, slot, itemStack);
					}
					this.prevHeldSlot = slot;
				}),
			);

			for (let i = 0; i < this.hotbarSlots; i++) {
				const itemStack = character.inventory.GetItem(i);
				this.UpdateHotbarSlot(i, character.GetHeldSlot(), itemStack, init, true);
			}
			this.prevHeldSlot = character.GetHeldSlot();
			init = false;

			return () => {
				invBin.Clean();
			};
		});
	}

	private UpdateTile(tile: GameObject, slot: number, itemStack: ItemStack | undefined): void {
		const inv = Airship.Inventory.localInventory;

		const tileComponent = tile.GetAirshipComponent<AirshipInventoryTile>();
		if (!tileComponent) {
			error("Missing AirshipInventoryTile component when updating inventory tile: " + tile.name);
		}

		if (tileComponent.slotNumberText !== undefined) {
			if (slot !== undefined && slot < this.hotbarSlots) {
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
				cachedSprite = Bridge.MakeDefaultSprite(texture2d);
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

	/**
	 * Binds the dragging events for the given {@link button} to the given {@link inventory}, with the slot index {@link slotIndex}
	 */
	private BindDragEventsOnButton(button: Button, inventory: Inventory, slotIndex: number): EngineEventConnection[] {
		return [
			CanvasAPI.OnBeginDragEvent(button.gameObject, () => {
				this.draggingBin.Clean();
				if (!this.IsBackpackShown()) return;
				const dragBeginEvent = Airship.Inventory.onInventorySlotDragBegin.Fire(
					new CancellableInventorySlotInteractionEvent(inventory, slotIndex),
				);
				if (dragBeginEvent.IsCancelled()) return;

				const itemStack = inventory.GetItem(slotIndex);
				if (!itemStack) return;

				const visual = button.transform.GetChild(0).gameObject;
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
					slot: slotIndex,
					itemStack,
					inventory: inventory,
					transform: cloneTransform,
					consumed: false,
				};
			}),
			CanvasAPI.OnDropEvent(button.gameObject, () => {
				if (!this.IsBackpackShown()) return;
				if (!this.draggingState) return;

				Airship.Inventory.MoveToSlot(
					this.draggingState.inventory,
					this.draggingState.slot,
					inventory,
					slotIndex,
					this.draggingState.itemStack.amount,
				);
				this.draggingState.consumed = true;
			}),
			CanvasAPI.OnEndDragEvent(button.gameObject, () => {
				this.draggingBin.Clean();

				if (this.draggingState) {
					Airship.Inventory.onInventorySlotDragEnd.Fire(
						new SlotDragEndedEvent(
							this.draggingState.inventory,
							this.draggingState.slot,
							this.draggingState.consumed,
						),
					);

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
			}),
		];
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
				Game.localPlayer.character?.SetHeldSlot(slot);
			});
		}
	}

	private QuickMoveSlot(inventory: Inventory, slot: number) {
		// If we have an external inventory, will need to swap to that instead on shift-click
		if (this.externalInventory) {
			const stack = inventory.GetItem(slot);
			if (!stack) return;
			const freeSlot = Keyboard.IsKeyDown(Key.LeftShift)
				? this.externalInventory.FindMergeableSlotWithItemType(stack.itemType) ??
				  this.externalInventory.GetFirstOpenSlot()
				: this.externalInventory.GetFirstOpenSlot();
			if (freeSlot === -1) return;

			Airship.Inventory.MoveToSlot(inventory, slot, this.externalInventory, freeSlot, stack.amount);
		} else {
			Airship.Inventory.QuickMoveSlot(inventory, slot, this.hotbarSlots);
		}
	}

	private SetupExternalInventory(inventory: Inventory) {
		const localInventory = Airship.Inventory.localInventory;

		if (!localInventory) return;
		if (!this.externalInventoryContent) {
			warn("External Inventory not supported by this inventory prefab");
			return;
		}

		if (!inventory.CanPlayerModifyInventory(Game.localPlayer)) return;
		this.externalInventory = inventory;

		// Pretty much we want to display & handle the external inventory interaction here if requested
		const bin = new Bin();
		this.externalInventoryContent.gameObject.SetActive(true);

		this.backpackLabel?.gameObject.SetActive(true);
		this.externalInventoryLabel?.gameObject.SetActive(true);

		const prompt = inventory.gameObject.GetAirshipComponentInChildren<ProximityPrompt>();

		if (this.externalInventoryLabel)
			this.externalInventoryLabel.text =
				prompt?.GetObjectText() ?? StringUtils.ncifyVariableName(inventory.gameObject.name);

		const count = this.externalInventoryContent.childCount;
		for (let i = 0; i < inventory.maxSlots; i++) {
			let tileGO: GameObject;
			if (i >= count) {
				tileGO = Object.Instantiate(
					this.otherInventoryTileTemplate ?? this.backpackHotbarTileTemplate!,
					this.externalInventoryContent,
				);
			} else {
				tileGO = this.externalInventoryContent.GetChild(i).gameObject;
			}

			this.slotToExternalInventoryTileMap.set(i, tileGO);

			const tile = tileGO.gameObject.GetAirshipComponentInChildren<AirshipInventoryTile>();
			if (!tile) continue;

			bin.AddEngineEventConnection(
				CanvasAPI.OnPointerEvent(tile.button.gameObject, (direction, button) => {
					if (direction !== PointerDirection.UP || this.draggingState) return;

					const openSlot = localInventory.GetFirstOpenSlot();
					if (openSlot === -1) return;

					const stack = inventory.GetItem(i);
					if (!stack) return;

					Airship.Inventory.onInventorySlotClicked.Fire(
						new InventorySlotMouseClickEvent(inventory, i, button),
					);
				}),
			);

			const connections = this.BindDragEventsOnButton(tile.button, inventory, i);
			for (const connection of connections) {
				bin.AddEngineEventConnection(connection);
			}
		}

		const slotBinMap = new Map<number, Bin>();
		bin.Add(
			inventory.ObserveSlots((stack, slot) => {
				slotBinMap.get(slot)?.Clean();
				if (slot > inventory.maxSlots) return;

				const slotBin = new Bin();
				slotBinMap.set(slot, slotBin);

				const tile = this.slotToExternalInventoryTileMap.get(slot)!;
				this.UpdateTile(tile, slot, stack);

				if (stack) {
					slotBin.Add(
						stack.amountChanged.Connect((e) => {
							this.UpdateTile(tile, slot, e.itemStack);
						}),
					);

					slotBin.Add(
						stack.itemTypeChanged.Connect((e) => {
							this.UpdateTile(tile, slot, e.itemStack);
						}),
					);
				}
			}),
		);

		bin.Add(() => {
			slotBinMap.forEach((bin) => bin.Clean());
			slotBinMap.clear();
		});

		// TODO: Layout hack, remove when update ordering fixed by Stephen
		{
			task.defer(() => {
				// Programming Gods, forgive me for I have sinned with this call
				LayoutRebuilder.ForceRebuildLayoutImmediate(
					this.backpackCanvas.transform.Find("BackpackWrapper").transform as RectTransform,
				);
			});
		}

		bin.Add(() => {
			this.externalInventory = undefined;
			this.backpackLabel?.gameObject.SetActive(false);
			this.externalInventoryLabel?.gameObject.SetActive(false);
			this.externalInventoryContent!.gameObject.SetActive(false);
		});

		return () => {
			bin.Clean();
		};
	}

	private SetupBackpack(): Bin {
		const inv = Airship.Inventory.localInventory!;

		// backpack hotbar slots
		const backpackHotbarContentChildCount = this.backpackHotbarContent.childCount;
		for (let i = 0; i < this.hotbarSlots; i++) {
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
		for (let i = 0; i < inv.maxSlots - this.hotbarSlots; i++) {
			let tileGO: GameObject;
			if (i >= backpackContentChildCount) {
				tileGO = Object.Instantiate(this.backpackTileTemplate, this.backpackContent);
			} else {
				tileGO = this.backpackContent.GetChild(i).gameObject;
			}
			this.slotToBackpackTileMap.set(i + this.hotbarSlots, tileGO);
		}

		const invBin = new Bin();
		let init = true;
		return Airship.Inventory.ObserveLocalInventory((inv) => {
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

				const tileComponent = tile.GetAirshipComponent<AirshipInventoryTile>()!;

				invBin.AddEngineEventConnection(
					CanvasAPI.OnPointerEvent(tileComponent.button.gameObject, (direction, button) => {
						if (direction !== PointerDirection.UP || this.draggingState) return;

						if (i < this.hotbarSlots) {
							// hotbar
							if (this.IsBackpackShown()) {
								Airship.Inventory.onInventorySlotClicked.Fire(
									new InventorySlotMouseClickEvent(inv, i, button),
								);
							} else {
								Game.localPlayer.character?.SetHeldSlot(i);
							}
						} else {
							Airship.Inventory.onInventorySlotClicked.Fire(
								new InventorySlotMouseClickEvent(inv, i, button),
							);
						}
					}),
				);

				for (const id of this.BindDragEventsOnButton(tileComponent.button, inv, i)) {
					invBin.AddEngineEventConnection(id);
				}
			}
			init = false;
		});
	}

	/**
	 * Gets the active external inventory (if applicable)
	 */
	public GetActiveExternalInventory(): Inventory | undefined {
		return this.externalInventory;
	}

	public IsBackpackShown(): boolean {
		return this.backpackShown;
	}

	protected OnDestroy(): void {
		this.bin.Clean();
	}
}
