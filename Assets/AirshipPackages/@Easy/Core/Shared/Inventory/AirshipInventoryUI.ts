import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { InventoryHotbarAction } from "@Easy/Core/Shared/Inventory/InventoryHotbarAction";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { Keyboard, Mouse } from "@Easy/Core/Shared/UserInput";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState, PointerButton, PointerDirection } from "@Easy/Core/Shared/Util/CanvasAPI";
import { InputUtils } from "@Easy/Core/Shared/Util/InputUtils";
import { OnUpdate } from "@Easy/Core/Shared/Util/Timer";
import { Asset } from "../Asset";
import { Game } from "../Game";
import { CoreAction } from "../Input/AirshipCoreAction";
import ProximityPrompt from "../Input/ProximityPrompts/ProximityPrompt";
import StringUtils from "../Types/StringUtil";
import { ClickPickupState, DraggingState } from "./AirshipDraggingState";
import AirshipInventoryTile from "./AirshipInventoryTile";
import Inventory from "./Inventory";
import { InventoryUIVisibility } from "./InventoryUIVisibility";
import {
	CancellableInventorySlotInteractionEvent,
	InventoryEvent,
	InventorySlotClickPickupEvent,
	InventorySlotMouseClickEvent,
	SlotDragEndedEvent,
} from "./Signal/SlotInteractionEvent";

const DESIGNATED_PICKUP_SLOT = -2;
export default class AirshipInventoryUI extends AirshipBehaviour {
	@Header("Variables")
	public darkBackground = true;
	public closeOnClickOutside = true;

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

	private slotToBackpackTileComponentMap = new Map<number, AirshipInventoryTile>();
	private slotToExternalInventoryTileComponentMap = new Map<number, AirshipInventoryTile>();
	private slotToHotbarTileComponentMap = new Map<number, AirshipInventoryTile>();
	private buttonToSlotIndexMap = new Map<Button, number>();

	private inventoryEnabled = true;
	private visible = false;
	private backpackEnabled = true;

	@NonSerialized() public draggingState: DraggingState | undefined;
	private draggingBin = new Bin();
	private draggedOverSlots = new Set<number>();
	private dragAmountToAdd = 0;

	private clickPickupState: ClickPickupState | undefined;
	private clickPickupBin = new Bin();
	// Track if we're currently in a drag operation with picked up item
	private isDraggingPickedUpItem = false;
	// Track original button state for adding highlights during drag
	private buttonOriginalState = new Map<Button, { color: Color; transition: Transition }>();
	// Track if we're in the initial pickup (to prevent drags during initial click)
	private isInitialPickupPhase = false;

	private bin = new Bin();
	private backpackOpenBin = new Bin();
	private keybindBin = new Bin();

	private isSetup = false;

	// Track current hotbar cleanup function
	private currentHotbarCleanup?: () => void;

	override Awake() {
		this.hotbarCanvas.enabled = false;
		this.backpackCanvas.gameObject.SetActive(false);
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
		Airship.Input.OnDown(CoreAction.Inventory).Connect((event) => {
			if (event.uiProcessed || !this.inventoryEnabled || !this.isSetup) return;
			if (this.IsBackpackShown() || AppManager.IsOpen()) {
				AppManager.Close();
			} else {
				this.OpenBackpack();
			}
		});

		if (this.closeOnClickOutside) {
			this.bin.AddEngineEventConnection(
				CanvasAPI.OnPointerEvent(this.dropItemCatcher.gameObject, (direction, button) => {
					if (!this.IsBackpackShown()) return;
					if (direction === PointerDirection.DOWN) {
						AppManager.Close();
					}
				}),
			);
		}

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

		// Add dragging events over the drop item catcher in case we start over it
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnBeginDragEvent(this.dropItemCatcher.gameObject, (data) => {
				this.BeginDragWithPickedUpItem(undefined, undefined, data.button === InputButton.Right);
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnEndDragEvent(this.dropItemCatcher.gameObject, () => {
				this.EndDragWithPickedUpItem();
			}),
		);
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

		this.backpackCanvas.gameObject.SetActive(true);
		AppManager.OpenCustom(
			() => {
				this.backpackShown = false;
				this.backpackCanvas.gameObject.SetActive(false);
				this.hotbarCanvas.enabled = true;
				this.backpackOpenBin.Clean();
			},
			{
				darkBackground: this.darkBackground,
			},
		);

		if (Airship.Inventory.localInventory) {
			Airship.Inventory.onInventoryOpened.Fire(new InventoryEvent(Airship.Inventory.localInventory));
			this.backpackOpenBin.Add(() =>
				Airship.Inventory.onInventoryClosed.Fire(new InventoryEvent(Airship.Inventory.localInventory!)),
			);
		}

		// Clean up click pickup state when backpack closes
		// If in pickup state add the item back to the first open slot or merge with an existing stack
		this.backpackOpenBin.Add(() => {
			if (this.clickPickupState) {
				Airship.Inventory.MoveToInventory(
					this.clickPickupState.inventory,
					this.clickPickupState.slot,
					this.clickPickupState.inventory,
				);
			}
			this.CleanupClickPickupState();
		});
	}

	/**
	 * Opens the backpack with an external inventory example a chest
	 * @param inventory The inventory to open alongside the backpack
	 * @returns A bin to clean up the connections
	 */
	public OpenBackpackWithExternalInventory(inventory: Inventory) {
		const closed = this.SetupExternalInventory(inventory);
		if (!closed) return;

		this.backpackOpenBin.Add(closed);
		this.backpackOpenBin.Add(() => Airship.Inventory.onInventoryClosed.Fire(new InventoryEvent(inventory)));

		// Open the regular backpack plspls
		this.OpenBackpack();

		Airship.Inventory.onInventoryOpened.Fire(new InventoryEvent(inventory));
		return this.backpackOpenBin;
	}

	public CloseBackpack(): void {
		if (!this.IsBackpackShown()) return;
		AppManager.Close();
	}

	public GetHotbarSlotCount(): number {
		return this.hotbarSlots;
	}

	private SetupHotbar(): Bin {
		this.hotbarCanvas.enabled = true;
		this.SetupHotbarKeybindListeners();

		let init = true;
		return Game.localPlayer.ObserveCharacter((character) => {
			if (!character) {
				return;
			}

			return this.SetupHotbarForCharacter(character, init);
		});
	}

	/**
	 * Sets up the hotbar to display inventory for any character. This will disconnect the current hotbar setup connections.
	 * @param character The character whose inventory to display
	 * @param init Whether this is the initial setup
	 * @returns Cleanup function
	 */
	private SetupHotbarForCharacter(character: Character, init: boolean = false): () => void {
		const invBin = new Bin();
		const slotBinMap = new Map<number, Bin>();

		if (character.inventory) {
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
		}

		invBin.Add(() => {
			for (const pair of slotBinMap) {
				pair[1].Clean();
			}
			slotBinMap.clear();
		});

		invBin.Add(
			character.onHeldSlotChanged.Connect((slot) => {
				for (let i = 0; i < this.hotbarSlots; i++) {
					const itemStack = character.inventory?.GetItem(i);
					this.UpdateHotbarSlot(i, slot, itemStack);
				}
				this.prevHeldSlot = slot;
			}),
		);

		// Initial setup of all hotbar slots
		for (let i = 0; i < this.hotbarSlots; i++) {
			const itemStack = character.inventory?.GetItem(i);
			this.UpdateHotbarSlot(i, character.GetHeldSlot(), itemStack, init, true);

			// Sets up item stacks that may exist before the hotbar is setup (e.g. from spectating a character)
			if (itemStack) {
				slotBinMap.get(i)?.Clean();
				const slotBin = new Bin();
				slotBinMap.set(i, slotBin);

				slotBin.Add(
					itemStack.amountChanged.Connect((e) => {
						this.UpdateHotbarSlot(i, character.GetHeldSlot(), itemStack);
					}),
				);
				slotBin.Add(
					itemStack.itemTypeChanged.Connect((e) => {
						this.UpdateHotbarSlot(i, character.GetHeldSlot(), itemStack);
					}),
				);
			}
		}
		this.prevHeldSlot = character.GetHeldSlot();

		return () => {
			invBin.Clean();
		};
	}

	/**
	 * Switches the hotbar to display a different character's inventory
	 * @param character The character whose inventory to display
	 */
	public SwitchHotbarToCharacter(character: Character | undefined): void {
		// Clean up existing connections
		if (this.currentHotbarCleanup) {
			this.currentHotbarCleanup();
			this.currentHotbarCleanup = undefined;
		}

		if (character) {
			this.currentHotbarCleanup = this.SetupHotbarForCharacter(character, true);
		} else {
			for (let i = 0; i < this.hotbarSlots; i++) {
				this.UpdateHotbarSlot(i, 0, undefined, true, true);
			}
		}
	}

	/**
	 * Cleans up the click pickup state, destroying the visual and clearing connections
	 */
	private CleanupClickPickupState(): void {
		if (this.clickPickupState) {
			Airship.Inventory.MoveToInventory(
				this.clickPickupState.inventory,
				DESIGNATED_PICKUP_SLOT,
				this.clickPickupState.inventory,
				this.clickPickupState.itemStack.amount,
			);
			this.clickPickupBin.Clean();
			this.clickPickupState = undefined;
		}
	}

	/**
	 * Creates a visual clone of an item that follows the mouse cursor for pickup/drag operations
	 * @param sourceButton The button to clone the visual from
	 * @returns The RectTransform of the cloned visual
	 */
	private CreatePickupVisual(sourceButton: Button): { itemAmountText: TMP_Text; itemAmountImage: Image } {
		this.clickPickupBin.Clean();
		const visual = sourceButton.transform.GetChild(0).gameObject;
		const clone = Object.Instantiate(visual, this.backpackCanvas.transform);
		const itemAmount = clone.transform.GetChild(1).GetComponent<TMP_Text>();

		clone.transform.SetAsLastSibling();
		const cloneRect = clone.GetComponent<RectTransform>()!;
		cloneRect.sizeDelta = new Vector2(100, 100);
		const cloneImage = clone.transform.GetChild(0).GetComponent<Image>()!;
		cloneImage.raycastTarget = false;

		const cloneTransform = clone.GetComponent<RectTransform>()!;
		cloneTransform.position = Mouse.GetPositionVector3();

		this.clickPickupBin.Add(
			OnUpdate.Connect((dt) => {
				cloneTransform.position = Mouse.GetPositionVector3();
			}),
		);

		this.clickPickupBin.Add(() => {
			Object.Destroy(clone.gameObject);
		});

		return { itemAmountText: itemAmount, itemAmountImage: cloneImage };
	}

	private UpdatePickupAmount(newAmount: number, textOnly?: boolean): void {
		if (!this.clickPickupState) return;
		if (!textOnly) {
			this.clickPickupState.itemStack.SetAmount(newAmount, { noNetwork: true });
		}

		if (newAmount <= 0) {
			this.clickPickupState.itemAmountImage.enabled = false;
			this.clickPickupState.itemAmountText.enabled = false;
			this.clickPickupState.itemAmountText.text = "";
		} else {
			if (newAmount > 1) {
				this.clickPickupState.itemAmountText.enabled = true;
				this.clickPickupState.itemAmountText.text = newAmount + "";
			}
			this.clickPickupState.itemAmountImage.enabled = true;
		}
	}

	private UpdateTile(tile: AirshipInventoryTile, slot: number, itemStack: ItemStack | undefined): void {
		if (slot < 0) return;
		const inv = Airship.Inventory.localInventory;

		if (tile.slotNumberText !== undefined) {
			if (slot !== undefined && slot < this.hotbarSlots) {
				// Get the keybind for this hotbar slot
				this.UpdateHotbarSlotKeybindText(tile, slot);
			} else {
				tile.slotNumberText.text = "";
			}
		}

		if (!itemStack) {
			tile.itemImage.enabled = false;
			tile.itemAmount.enabled = false;
			tile.itemName.enabled = false;
			return;
		}

		const itemType = itemStack.itemType;
		let imageSrc = itemStack.itemDef.image;
		let sprite: Sprite | undefined;
		if (imageSrc) {
			if (!StringUtils.endsWith(imageSrc, ".sprite")) {
				imageSrc += ".sprite";
			}
			sprite = Asset.LoadAssetIfExists<Sprite>(imageSrc);
		}
		if (sprite) {
			tile.itemImage.sprite = sprite;
			tile.itemImage.enabled = true;
			tile.itemName.enabled = false;
		} else {
			tile.itemName.text = itemStack.itemDef.displayName;
			tile.itemName.enabled = true;
			tile.itemImage.enabled = false;
		}

		tile.itemAmount.enabled = true;
		const amountText = itemStack.amount > 1 ? itemStack.amount + "" : "";
		// Use SetText to ensure TextMeshPro properly updates, especially when text length changes
		// (e.g., going from 4 digits to 3 digits like 1000 -> 500)
		tile.itemAmount.SetText(amountText);
	}

	/**
	 * Updates a tile to show a drag preview without creating a new ItemStack
	 * @param tile The tile component to update
	 * @param slot The slot number
	 * @param draggedItemStack The ItemStack being dragged
	 * @param previewAmount The amount that would be dropped into this slot
	 * @param currentItemInSlot The current item in the slot
	 * @param updateAmountOnly If true, only updates the amount text without changing image/name
	 */
	private UpdateDraggedPreviewTile(
		tile: AirshipInventoryTile,
		slot: number,
		draggedItemStack: ItemStack,
		previewAmount: number,
		currentItemInSlot: ItemStack | undefined,
		updateAmountOnly?: boolean,
	): void {
		if (slot < 0) return;

		const previewTotalAmount =
			currentItemInSlot && currentItemInSlot.itemType === draggedItemStack.itemType
				? currentItemInSlot.amount + previewAmount
				: previewAmount;

		if (!updateAmountOnly) {
			let imageSrc = draggedItemStack.itemDef.image;
			let sprite: Sprite | undefined;
			if (imageSrc) {
				if (!StringUtils.endsWith(imageSrc, ".sprite")) {
					imageSrc += ".sprite";
				}
				sprite = Asset.LoadAssetIfExists<Sprite>(imageSrc);
			}
			if (sprite) {
				tile.itemImage.sprite = sprite;
				tile.itemImage.enabled = true;
				tile.itemName.enabled = false;
			} else {
				tile.itemName.text = draggedItemStack.itemDef.displayName;
				tile.itemName.enabled = true;
				tile.itemImage.enabled = false;
			}
		}

		tile.itemAmount.enabled = true;
		const amountText = previewTotalAmount > 1 ? previewTotalAmount + "" : "";
		tile.itemAmount.SetText(amountText);
	}

	// TODO: When back from break
	/**
	 * Add drag back so we can throw items out of the inventory
	 * Add Dragging held item to split multiple stacks
	 * Double check that everything is synced server/client
	 * Double check if things are working with external inventory
	 */
	private BindDragEventsOnButton(button: Button, inventory: Inventory, slotIndex: number): EngineEventConnection[] {
		return [
			// Handle DOWN direction for picking up items
			CanvasAPI.OnPointerEvent(button.gameObject, (direction, pointerButton) => {
				if (!this.IsBackpackShown() || direction !== PointerDirection.DOWN || this.clickPickupState) return;

				const targetSlotIndex = this.GetSlotIndexFromButton(button);
				if (targetSlotIndex === undefined) return;
				const existingItemStack = inventory.GetItem(targetSlotIndex);

				// Pickup items on DOWN direction
				if (existingItemStack) {
					if (
						pointerButton === PointerButton.LEFT ||
						(pointerButton === PointerButton.RIGHT && existingItemStack.amount <= 1)
					) {
						const clickPickupEvent = Airship.Inventory.onInventorySlotClickPickup.Fire(
							new InventorySlotClickPickupEvent(inventory, slotIndex),
						);
						if (clickPickupEvent.IsCancelled()) {
							return;
						}

						const { itemAmountText, itemAmountImage } = this.CreatePickupVisual(button);
						this.clickPickupState = {
							inventory,
							slot: slotIndex,
							itemStack: existingItemStack,
							itemAmountText: itemAmountText,
							itemAmountImage: itemAmountImage,
							initialClickFlag: true,
						};

						this.isInitialPickupPhase = true;
						Airship.Inventory.MoveToSlot(
							inventory,
							slotIndex,
							inventory,
							DESIGNATED_PICKUP_SLOT,
							existingItemStack.amount,
						);
					} else if (pointerButton === PointerButton.RIGHT) {
						const clickPickupEvent = Airship.Inventory.onInventorySlotClickPickup.Fire(
							new InventorySlotClickPickupEvent(inventory, slotIndex),
						);
						if (clickPickupEvent.IsCancelled()) {
							return;
						}
						const halfAmount = math.ceil(existingItemStack.amount / 2);
						const { itemAmountText, itemAmountImage } = this.CreatePickupVisual(button);
						const halfStack = new ItemStack(existingItemStack.itemType, halfAmount);

						this.clickPickupState = {
							inventory,
							slot: slotIndex,
							itemStack: halfStack,
							itemAmountText: itemAmountText,
							itemAmountImage: itemAmountImage,
							halfStack: true,
							initialClickFlag: true,
						};

						this.isInitialPickupPhase = true;
						Airship.Inventory.MoveToSlot(
							inventory,
							slotIndex,
							inventory,
							DESIGNATED_PICKUP_SLOT,
							halfAmount,
						);

						this.UpdatePickupAmount(halfAmount);
					}
				}
			}),
			// Handle UP direction for placing items
			CanvasAPI.OnPointerEvent(button.gameObject, (direction, pointerButton) => {
				if (
					!this.IsBackpackShown() ||
					!this.clickPickupState ||
					this.isDraggingPickedUpItem ||
					direction !== PointerDirection.UP
				)
					return;
				const targetSlotIndex = this.GetSlotIndexFromButton(button);
				if (targetSlotIndex === undefined) return;

				// Prevent immediate placement back on the same slot where we picked up
				if (
					this.clickPickupState.initialClickFlag &&
					targetSlotIndex === this.clickPickupState.slot &&
					inventory === this.clickPickupState.inventory &&
					!this.clickPickupState.swapStack
				) {
					// Clear the flag so future UP events on different slots can place
					this.clickPickupState.initialClickFlag = false;
					this.isInitialPickupPhase = false;
					return;
				}
				this.isInitialPickupPhase = false;

				const existingItemStack = inventory.GetItem(targetSlotIndex);

				// Place items on UP direction
				if (pointerButton === PointerButton.LEFT) {
					if (
						existingItemStack &&
						(targetSlotIndex !== this.clickPickupState.slot || this.clickPickupState.swapStack)
					) {
						if (existingItemStack.itemType === this.clickPickupState.itemStack.itemType) {
							// If the item type is the same, we can merge the stacks
							const maxStackSize = existingItemStack.GetMaxStackSize();
							const spaceAvailable = maxStackSize - existingItemStack.amount;
							const amountToAdd = math.min(spaceAvailable, this.clickPickupState.itemStack.amount);

							Airship.Inventory.MoveToSlot(
								this.clickPickupState.inventory,
								DESIGNATED_PICKUP_SLOT,
								inventory,
								targetSlotIndex,
								amountToAdd,
							);

							this.UpdatePickupAmount(this.clickPickupState.itemStack.amount - amountToAdd);

							if (this.clickPickupState.itemStack.amount <= 0) {
								this.CleanupClickPickupState();
							}
						} else {
							// If the item type is different, we need to swap the stacks
							const originalAmount = this.clickPickupState.itemStack.amount;
							const localInventory = Airship.Inventory.localInventory;
							const { itemAmountText, itemAmountImage } = this.CreatePickupVisual(button);

							Airship.Inventory.MoveToSlot(
								this.clickPickupState.inventory,
								DESIGNATED_PICKUP_SLOT,
								inventory,
								targetSlotIndex,
								originalAmount,
							);

							if (localInventory) {
								if (this.clickPickupState.inventory !== localInventory) {
									// Pickup was from external inventory, swapped item is in external's DESIGNATED_PICKUP_SLOT
									// Move it to local inventory's DESIGNATED_PICKUP_SLOT
									const swappedItem = this.clickPickupState.inventory.GetItem(DESIGNATED_PICKUP_SLOT);
									if (swappedItem) {
										Airship.Inventory.MoveToSlot(
											this.clickPickupState.inventory,
											DESIGNATED_PICKUP_SLOT,
											localInventory,
											DESIGNATED_PICKUP_SLOT,
											swappedItem.amount,
										);
									}
								}
							}

							const swappedItem = this.clickPickupState.inventory.GetItem(DESIGNATED_PICKUP_SLOT);
							if (!swappedItem) {
								this.CleanupClickPickupState();
								return;
							}
							this.clickPickupState = {
								inventory: this.clickPickupState.inventory,
								slot: DESIGNATED_PICKUP_SLOT,
								itemStack: swappedItem,
								itemAmountText: itemAmountText,
								itemAmountImage: itemAmountImage,
								swapStack: true,
								initialClickFlag: false,
							};
						}
					} else {
						// Empty slot - place the entire picked-up item into the slot and clear pickup state
						Airship.Inventory.MoveToSlot(
							this.clickPickupState.inventory,
							DESIGNATED_PICKUP_SLOT,
							inventory,
							targetSlotIndex,
							this.clickPickupState.itemStack.amount,
						);
						this.CleanupClickPickupState();
					}
				} else if (pointerButton === PointerButton.RIGHT) {
					if (
						existingItemStack &&
						(targetSlotIndex !== this.clickPickupState.slot ||
							this.clickPickupState.swapStack ||
							inventory !== this.clickPickupState.inventory)
					) {
						// Slot has an item - check if we can merge then decrement by 1
						if (existingItemStack.itemType === this.clickPickupState.itemStack.itemType) {
							const maxStackSize = existingItemStack.GetMaxStackSize();
							if (existingItemStack.amount < maxStackSize) {
								Airship.Inventory.MoveToSlot(
									this.clickPickupState.inventory,
									DESIGNATED_PICKUP_SLOT,
									inventory,
									targetSlotIndex,
									1,
								);
								this.UpdatePickupAmount(this.clickPickupState.itemStack.amount - 1);

								// Clear the initial click flag since we've placed on a different slot
								if (this.clickPickupState) {
									this.clickPickupState.initialClickFlag = false;
								}

								if (this.clickPickupState.itemStack.amount <= 0) {
									this.CleanupClickPickupState();
								}
							}
						} else {
							// If the item type is different, we need to swap the stacks
							const originalAmount = this.clickPickupState.itemStack.amount;
							const localInventory = Airship.Inventory.localInventory;
							const { itemAmountText, itemAmountImage } = this.CreatePickupVisual(button);

							Airship.Inventory.MoveToSlot(
								this.clickPickupState.inventory,
								DESIGNATED_PICKUP_SLOT,
								inventory,
								targetSlotIndex,
								originalAmount,
							);
							if (localInventory) {
								if (this.clickPickupState.inventory !== localInventory) {
									// Pickup was from external inventory, swapped item is in external's DESIGNATED_PICKUP_SLOT
									const swappedItem = this.clickPickupState.inventory.GetItem(DESIGNATED_PICKUP_SLOT);
									if (swappedItem) {
										Airship.Inventory.MoveToSlot(
											this.clickPickupState.inventory,
											DESIGNATED_PICKUP_SLOT,
											localInventory,
											DESIGNATED_PICKUP_SLOT,
											swappedItem.amount,
										);
									}
								}
							}

							const swappedItem = this.clickPickupState.inventory.GetItem(DESIGNATED_PICKUP_SLOT);
							if (!swappedItem) {
								this.CleanupClickPickupState();
								return;
							}

							this.clickPickupState = {
								inventory: this.clickPickupState.inventory,
								slot: DESIGNATED_PICKUP_SLOT,
								itemStack: swappedItem,
								itemAmountText: itemAmountText,
								itemAmountImage: itemAmountImage,
								swapStack: true,
								initialClickFlag: false,
							};
						}
					} else {
						// Right-clicking empty slot
						Airship.Inventory.MoveToSlot(
							this.clickPickupState.inventory,
							DESIGNATED_PICKUP_SLOT,
							inventory,
							targetSlotIndex,
							1,
						);
						this.UpdatePickupAmount(this.clickPickupState.itemStack.amount - 1);

						if (this.clickPickupState.itemStack.amount <= 0) {
							this.CleanupClickPickupState();
						}
					}
				}
			}),

			// Add dragging events over buttons in case we start over the buttons
			CanvasAPI.OnBeginDragEvent(button.gameObject, (data) => {
				this.BeginDragWithPickedUpItem(button, slotIndex, data.button === InputButton.Right);
			}),

			CanvasAPI.OnEndDragEvent(button.gameObject, () => {
				this.EndDragWithPickedUpItem();
			}),

			// Track when the picked up item is dragged over this button
			CanvasAPI.OnHoverEvent(button.gameObject, (hoverState, data) => {
				if (!this.clickPickupState || !this.isDraggingPickedUpItem) return;
				if (hoverState === HoverState.ENTER) {
					// Use the stored right click state from when the drag began
					const rightClick = this.clickPickupState.isRightClickDrag ?? false;
					this.AddButtonToDragOver(button, slotIndex, rightClick);
				}
			}),
		];
	}

	/**
	 * Hooks up split stack when dragging a picked up item across slots
	 */
	private BeginDragWithPickedUpItem(
		button: Button | undefined,
		slotIndex: number | undefined,
		rightClick: boolean,
	): void {
		if (!this.clickPickupState || this.isInitialPickupPhase || this.isDraggingPickedUpItem) return;

		this.isDraggingPickedUpItem = true;

		this.clickPickupState.isRightClickDrag = rightClick;
		this.draggedOverSlots.clear();

		// Add the initial button/slot where the drag started
		if (button !== undefined && slotIndex !== undefined) {
			this.AddButtonToDragOver(button, slotIndex, rightClick);
		}
	}

	/**
	 * Cleans up the drag operation when the picked up item is dropped
	 */
	private EndDragWithPickedUpItem(): void {
		if (this.isInitialPickupPhase || !this.isDraggingPickedUpItem || !this.clickPickupState) return;
		this.isDraggingPickedUpItem = false;
		if (this.dragAmountToAdd > 0) {
			for (const draggedOverSlot of this.draggedOverSlots) {
				Airship.Inventory.MoveToSlot(
					this.clickPickupState.inventory,
					DESIGNATED_PICKUP_SLOT,
					this.clickPickupState.inventory,
					draggedOverSlot,
					this.dragAmountToAdd,
				);
			}
		}
		this.draggedOverSlots.clear();
	}

	private AddButtonToDragOver(button: Button, slotIndex: number, rightClick: boolean): void {
		if (!this.clickPickupState) {
			return;
		}

		const existing = this.draggedOverSlots.has(slotIndex);
		if (existing) {
			return;
		}
		const itemInSlotIndex = this.clickPickupState.inventory.GetItem(slotIndex);
		if (itemInSlotIndex?.itemType === this.clickPickupState.itemStack.itemType || itemInSlotIndex === undefined) {
			this.draggedOverSlots.add(slotIndex);
			this.AddDropPreview(button, slotIndex, rightClick);
		}
	}

	private AddDropPreview(button: Button, slotIndex: number, rightClick: boolean): void {
		if (!this.clickPickupState || this.draggedOverSlots.size() === 0) {
			return;
		}

		// Calculate how many items we should drop to each slot depending on click direction
		const numberOfDraggedSlots = this.draggedOverSlots.size();
		const currentStackSize = this.clickPickupState.itemStack.amount;
		const amountToDropToEachSlot = rightClick
			? 1
			: math.max(1, math.floor(currentStackSize / numberOfDraggedSlots));

		this.dragAmountToAdd = amountToDropToEachSlot;

		// Update the visual clone amount by how many items we "Drop"
		const totalAmountToDrop = amountToDropToEachSlot * numberOfDraggedSlots;
		const remainingAmount = math.max(0, currentStackSize - totalAmountToDrop);
		this.UpdatePickupAmount(remainingAmount, true);

		// Update all hovered slots with preview amounts
		for (const draggedOverSlot of this.draggedOverSlots) {
			const draggedOverTile = this.slotToBackpackTileComponentMap.get(draggedOverSlot);
			if (!draggedOverTile) {
				warn("Missing AirshipInventoryTile component when adding drop preview: " + draggedOverSlot);
				continue;
			}
			const currentItemInSlot = this.clickPickupState.inventory.GetItem(draggedOverSlot);
			// Only set image/name for the newly added slot, update amount for others
			const isNewSlot = draggedOverSlot === slotIndex;
			this.UpdateDraggedPreviewTile(
				draggedOverTile,
				draggedOverSlot,
				this.clickPickupState.itemStack,
				amountToDropToEachSlot,
				currentItemInSlot,
				!isNewSlot,
			);
		}

		this.HighlightButton(button);
	}

	/**
	 * Highlights a button during drag operations by applying Unity's highlighted color
	 */
	private HighlightButton(button: Button): void {
		if (!button.targetGraphic) return;

		if (!this.buttonOriginalState.has(button)) {
			this.buttonOriginalState.set(button, {
				color: button.targetGraphic.color,
				transition: button.transition,
			});
			// Disable Unity's automatic transition while dragging
			button.transition = Transition.None;
		}

		const colors = button.colors;
		const finalHighlightColor = new Color(
			colors.highlightedColor.r * colors.colorMultiplier,
			colors.highlightedColor.g * colors.colorMultiplier,
			colors.highlightedColor.b * colors.colorMultiplier,
			colors.highlightedColor.a,
		);

		button.targetGraphic.CrossFadeColor(finalHighlightColor, colors.fadeDuration, true, true);

		// Restore original state when drag ends
		this.clickPickupBin.Add(() => {
			const originalState = this.buttonOriginalState.get(button);
			if (originalState) {
				button.targetGraphic.CrossFadeColor(originalState.color, colors.fadeDuration, true, true);
				button.transition = originalState.transition;
				this.buttonOriginalState.delete(button);
			}
		});
	}

	/**
	 * Gets the slot index from a button using the button-to-slot map
	 * @param button The button to get the slot index from
	 * @returns The slot index, or undefined if not found
	 */
	private GetSlotIndexFromButton(button: Button): number | undefined {
		return this.buttonToSlotIndexMap.get(button);
	}

	/**
	 * Binds the dragging events for the given {@link button} to the given {@link inventory}, with the slot index {@link slotIndex}
	 */
	private BindDragEventsOnButtons(button: Button, inventory: Inventory, slotIndex: number): EngineEventConnection[] {
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

				// const slotNumber = clone.transform.Find("SlotNumber");
				// slotNumber?.gameObject.SetActive(false);

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

	/**
	 * Updates the slot number text for a hotbar slot based on its keybind
	 */
	private UpdateHotbarSlotKeybindText(tileComponent: AirshipInventoryTile, slot: number): void {
		if (!tileComponent.slotNumberText) return;

		const hotbarActionName = `Hotbar Slot ${slot + 1}` as InventoryHotbarAction;
		const actions = Airship.Input.GetActions(hotbarActionName);

		const action = actions.find((a) => {
			const key = a.binding.GetKey();
			const mouseButton = a.binding.GetMouseButton();
			return key !== undefined || mouseButton !== undefined;
		});

		if (action) {
			const key = action.binding.GetKey();
			if (key !== undefined) {
				const keyString = InputUtils.GetStringForKeyCode(key);
				// Only use the key string if it's a single character
				if (keyString && keyString.size() === 1) {
					tileComponent.slotNumberText.text = keyString;
				} else {
					tileComponent.slotNumberText.text = `${slot + 1}`;
				}
			} else {
				tileComponent.slotNumberText.text = `${slot + 1}`;
			}
		} else {
			tileComponent.slotNumberText.text = `${slot + 1}`;
		}
	}

	/**
	 * Sets up keybind change listeners for hotbar slots
	 */
	private SetupHotbarKeybindListeners(): void {
		for (let slot = 0; slot < this.hotbarSlots; slot++) {
			const hotbarActionName = `Hotbar Slot ${slot + 1}` as InventoryHotbarAction;
			const lowerActionName = hotbarActionName.lower();

			this.keybindBin.Add(
				Airship.Input.onActionBound.Connect((action) => {
					if (action.internalName === lowerActionName) {
						if (slot < this.hotbarContent.childCount) {
							const tileComponent = this.slotToHotbarTileComponentMap.get(slot);
							if (tileComponent && tileComponent.slotNumberText) {
								this.UpdateHotbarSlotKeybindText(tileComponent, slot);
							}
						}
					}
				}),
			);
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
		if (slot === DESIGNATED_PICKUP_SLOT) return;
		if (slot >= this.hotbarContent.childCount) {
			go = Object.Instantiate(this.hotbarTileTemplate, this.hotbarContent);
		} else {
			go = this.hotbarContent.GetChild(slot).gameObject;
		}

		// Get or cache the component
		let hotbarTileComponent = this.slotToHotbarTileComponentMap.get(slot);
		if (!hotbarTileComponent) {
			hotbarTileComponent = go.GetAirshipComponent<AirshipInventoryTile>();
			if (!hotbarTileComponent) {
				warn("Missing AirshipInventoryTile component when updating hotbar slot: " + slot);
				return;
			}
			this.slotToHotbarTileComponentMap.set(slot, hotbarTileComponent);
		}
		this.UpdateTile(hotbarTileComponent, slot, itemStack);

		const contentGO = go.transform.GetChild(0).gameObject;
		const contentRect = contentGO.GetComponent<RectTransform>()!;
		if (selectedSlot === slot && (this.prevHeldSlot !== slot || reset)) {
			task.defer(() => {
				NativeTween.AnchoredPositionY(contentRect, 10, 0.1);
			});
		} else if (selectedSlot !== slot && (this.prevHeldSlot === slot || reset)) {
			task.defer(() => {
				NativeTween.AnchoredPositionY(contentRect, 0, 0.1);
			});
		}

		if (init) {
			let tileComponent = this.slotToHotbarTileComponentMap.get(slot);
			if (!tileComponent) {
				tileComponent = go.GetAirshipComponent<AirshipInventoryTile>()!;
				this.slotToHotbarTileComponentMap.set(slot, tileComponent);
			}
			this.bin.Add(
				tileComponent.button.onClick.Connect(() => {
					Game.localPlayer.character?.SetHeldSlot(slot);
				}),
			);
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

			const tile = tileGO.gameObject.GetAirshipComponentInChildren<AirshipInventoryTile>();
			if (!tile) continue;
			this.slotToExternalInventoryTileComponentMap.set(i, tile);
			this.buttonToSlotIndexMap.set(tile.button, i);

			bin.AddEngineEventConnection(
				CanvasAPI.OnPointerEvent(tile.button.gameObject, (direction, button) => {
					if (direction !== PointerDirection.UP || this.draggingState) return;

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
				if (slot < 0 || slot > inventory.maxSlots) return;

				slotBinMap.get(slot)?.Clean();
				const slotBin = new Bin();
				slotBinMap.set(slot, slotBin);

				const tile = this.slotToExternalInventoryTileComponentMap.get(slot);
				if (!tile) {
					warn("Missing AirshipInventoryTile component when updating external inventory slot: " + slot);
					return;
				}
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
			// Clean up button mappings for external inventory
			for (let i = 0; i < inventory.maxSlots; i++) {
				const tileComponent = this.slotToExternalInventoryTileComponentMap.get(i);
				if (tileComponent) {
					this.buttonToSlotIndexMap.delete(tileComponent.button);
				}
				this.slotToExternalInventoryTileComponentMap.delete(i);
			}
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
				const tileComponent = tileGO.GetAirshipComponent<AirshipInventoryTile>();
				if (tileComponent) {
					this.slotToBackpackTileComponentMap.set(i, tileComponent);
				}
			} else {
				tileGO = this.backpackHotbarContent.GetChild(i).gameObject;
			}
			if (!this.slotToBackpackTileComponentMap.has(i)) {
				const inventoryTileComponent = tileGO.GetAirshipComponent<AirshipInventoryTile>();
				if (inventoryTileComponent) {
					this.slotToBackpackTileComponentMap.set(i, inventoryTileComponent);
				} else {
					warn("Missing AirshipInventoryTile component when updating backpack slot: " + i);
				}
			}
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
			if (!this.slotToBackpackTileComponentMap.has(i + this.hotbarSlots)) {
				const inventoryTileComponent = tileGO.GetAirshipComponent<AirshipInventoryTile>();
				if (inventoryTileComponent) {
					this.slotToBackpackTileComponentMap.set(i + this.hotbarSlots, inventoryTileComponent);
				} else {
					warn("Missing AirshipInventoryTile component when updating backpack slot: " + i + this.hotbarSlots);
				}
			}
		}

		const invBin = new Bin();
		let init = true;
		return Airship.Inventory.ObserveLocalInventory((inv) => {
			invBin.Clean();
			const slotBinMap = new Map<number, Bin>();

			inv.onSlotChanged.Connect((slot, itemStack) => {
				if (slot < 0 || slot > inv.maxSlots) return;

				slotBinMap.get(slot)?.Clean();
				const slotBin = new Bin();
				slotBinMap.set(slot, slotBin);

				const tile = this.slotToBackpackTileComponentMap.get(slot);
				if (!tile) {
					warn("Missing AirshipInventoryTile component when updating backpack slot: " + slot);
					return;
				}
				this.UpdateTile(tile, slot, itemStack);

				if (itemStack) {
					slotBin.Add(
						itemStack.amountChanged.Connect((e) => {
							this.UpdateTile(tile, slot, e.itemStack);
						}),
					);
					slotBin.Add(
						itemStack.itemTypeChanged.Connect((e) => {
							this.UpdateTile(tile, slot, e.itemStack);
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
				const itemStack = inv.GetItem(i);
				let tileComponent = this.slotToBackpackTileComponentMap.get(i);
				if (!tileComponent) {
					warn("Missing AirshipInventoryTile component when updating backpack slot: " + i);
					return;
				}

				this.UpdateTile(tileComponent, i, itemStack);

				// Set up amountChanged connection for existing items (in case onSlotChanged hasn't fired yet)
				if (itemStack) {
					const existingSlotBin = slotBinMap.get(i);
					if (!existingSlotBin) {
						const slotBin = new Bin();
						slotBinMap.set(i, slotBin);

						slotBin.Add(
							itemStack.amountChanged.Connect((e) => {
								this.UpdateTile(tileComponent, i, e.itemStack);
							}),
						);
						slotBin.Add(
							itemStack.itemTypeChanged.Connect((e) => {
								this.UpdateTile(tileComponent, i, e.itemStack);
							}),
						);
						invBin.Add(slotBin);
					}
				}

				this.buttonToSlotIndexMap.set(tileComponent.button, i);

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
		this.keybindBin.Clean();
		this.CleanupClickPickupState();
	}
}
