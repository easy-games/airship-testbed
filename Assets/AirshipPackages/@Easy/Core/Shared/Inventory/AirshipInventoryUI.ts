import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { InventoryHotbarAction } from "@Easy/Core/Shared/Inventory/InventoryHotbarAction";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState, PointerButton, PointerDirection } from "@Easy/Core/Shared/Util/CanvasAPI";
import { InputUtils } from "@Easy/Core/Shared/Util/InputUtils";
import { OnUpdate, SetTimeout } from "@Easy/Core/Shared/Util/Timer";
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
	InventorySlotMouseClickEvent,
	SlotDragEndedEvent,
} from "./Signal/SlotInteractionEvent";

const DESIGNATED_PICKUP_SLOT = -2;
const DOUBLE_CLICK_MERGE_DELAY = 0.3;
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

	private externalInventory?: Inventory;
	private backpackShown = false;

	private slotToBackpackTileComponentMap = new Map<number, AirshipInventoryTile>();
	private slotToExternalInventoryTileComponentMap = new Map<number, AirshipInventoryTile>();
	private slotToHotbarTileComponentMap = new Map<number, AirshipInventoryTile>();
	private buttonToSlotIndexMap = new Map<Button, number>();

	private inventoryEnabled = true;
	private visible = false;
	private backpackEnabled = true;

	private draggedOverSlots = new Map<Inventory, Set<number>>();
	private dragAmountToAdd = 0;

	private clickPickupState: ClickPickupState | undefined;
	private clickPickupBin = new Bin();
	// Track if we're currently in a drag operation with picked up item
	private isDraggingPickedUpItem = false;
	private draggingBin = new Bin();
	// Track original button state for adding highlights during drag
	private buttonOriginalState = new Map<Button, { color: Color; transition: Transition }>();
	// Track if we're in the initial pickup (to prevent drags during initial click)
	private isInitialPickupPhase = false;
	// Track double-click timer for if we need to merge items.
	private doubleClickTimerCancel: (() => void) | undefined;

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
			const hotbarCleanup = this.SetupHotbar();
			const backpackCleanup = this.SetupBackpack();
			return () => {
				hotbarCleanup.Clean();
				backpackCleanup.Clean();
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

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnPointerEvent(this.dropItemCatcher.gameObject, (direction, button) => {
				if (!this.IsBackpackShown()) return;
				if (direction === PointerDirection.DOWN) {
					if (this.clickPickupState) {
						// Create dragging state from clickPickupState.  I made this happen on click with the new setup, unsure if we should change
						// the name as well since might affect other games that are using this event.
						// Could also get rid of draggingstate entirely I just created this for backwards compatability for now
						const itemStack = this.clickPickupState.inventory.GetItem(DESIGNATED_PICKUP_SLOT);
						if (itemStack) {
							const draggingState: DraggingState = {
								inventory: this.clickPickupState.inventory,
								itemStack: itemStack,
								slot: DESIGNATED_PICKUP_SLOT,
								pointerButton: button,
							};

							Airship.Inventory.localInventory?.onDraggedOutsideInventory.Fire(draggingState);
							this.CleanupClickPickupState(true);
						}
					}
					if (this.closeOnClickOutside) {
						AppManager.Close();
					}
				}
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnBeginDragEvent(this.dropItemCatcher.gameObject, (data) => {
				this.BeginDragWithPickedUpItem(undefined, undefined, undefined, data.button === InputButton.Right);
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
	// Todo: Fix max drag based on current stack size
	// Find out why we are getting ghost items with external inventory
	// Verify shared mode fixes.

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
			// Cancel any drag previews and restore tiles to their actual state
			this.CancelDragPreviews();

			if (this.clickPickupState) {
				Airship.Inventory.MoveToInventory(
					this.clickPickupState.inventory,
					DESIGNATED_PICKUP_SLOT,
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
	 * This is the main function that handles binding inventory interactions relating to the action done by the player.
	 * @param button The button that the player is clicking on.
	 * @param inventory The inventory that the player is interacting with.
	 * @param slotIndex The slot index that the player is interacting with.
	 */
	private BindDragEventsOnButton(button: Button, inventory: Inventory, slotIndex: number): EngineEventConnection[] {
		return [
			// Handle DOWN direction for picking up items
			CanvasAPI.OnPointerEvent(button.gameObject, (direction, pointerButton) => {
				if (!this.IsBackpackShown() || direction !== PointerDirection.DOWN || this.clickPickupState) return;

				// Prevent picking up items if double-click timer is active (this is a potential double-click)
				if (this.doubleClickTimerCancel && pointerButton === PointerButton.LEFT) {
					return;
				}

				Airship.Inventory.onInventorySlotClicked.Fire(
					new InventorySlotMouseClickEvent(inventory, slotIndex, pointerButton),
				);

				const targetSlotIndex = this.GetSlotIndexFromButton(button);
				if (targetSlotIndex === undefined) return;
				const existingItemStack = inventory.GetItem(targetSlotIndex);

				if (
					existingItemStack &&
					pointerButton === PointerButton.LEFT &&
					(Game.IsMobile() || Airship.Input.IsDown(CoreAction.InventoryQuickMoveModifierKey))
				) {
					this.QuickMoveSlot(inventory, targetSlotIndex);
					return;
				}

				// Pickup items on DOWN direction
				if (existingItemStack) {
					this.HandleItemPickup(inventory, slotIndex, existingItemStack, button, pointerButton);
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
				// Check for double-click merge if there is a 2nd click within the time window
				// Only trigger if clicking on the same slot and inventory where we picked up
				const isSameSlot =
					targetSlotIndex === this.clickPickupState.slot && inventory === this.clickPickupState.inventory;
				if (
					this.doubleClickTimerCancel &&
					pointerButton === PointerButton.LEFT &&
					isSameSlot &&
					!this.clickPickupState.swapStack
				) {
					this.CancelDoubleClickTimer();
					this.clickPickupState.initialClickFlag = false;
					this.isInitialPickupPhase = false;
					this.DoubleClickMerge();
					return;
				}
				// Cancel double click timer if we are past the window
				this.CancelDoubleClickTimer();

				const existingItemStack = inventory.GetItem(targetSlotIndex);

				// Place items on UP direction
				if (pointerButton === PointerButton.LEFT) {
					if (
						existingItemStack &&
						(targetSlotIndex !== this.clickPickupState.slot || this.clickPickupState.swapStack)
					) {
						if (existingItemStack.itemType === this.clickPickupState.itemType) {
							// Same item type - merge stacks
							this.HandleItemStackMerge(inventory, targetSlotIndex, existingItemStack);
						} else {
							// Different item type - swap stacks
							if (!this.HandleItemStackSwap(inventory, targetSlotIndex, button)) {
								return;
							}
						}
					} else {
						// Empty slot - place the entire picked-up item into the slot and clear pickup state
						Airship.Inventory.MoveToSlot(
							this.clickPickupState.inventory,
							DESIGNATED_PICKUP_SLOT,
							inventory,
							targetSlotIndex,
							this.clickPickupState.amount,
						);
						this.CleanupClickPickupState();
					}
				} else if (pointerButton === PointerButton.RIGHT) {
					// Right-click: place one item at a time
					const canPlaceOnSlot =
						!existingItemStack ||
						targetSlotIndex !== this.clickPickupState.slot ||
						this.clickPickupState.swapStack ||
						inventory !== this.clickPickupState.inventory;

					if (canPlaceOnSlot) {
						this.HandleSingleItemPlacement(inventory, targetSlotIndex, existingItemStack, button);
					}
				}
			}),

			// Add dragging events over buttons in case we start over the buttons
			CanvasAPI.OnBeginDragEvent(button.gameObject, (data) => {
				this.BeginDragWithPickedUpItem(button, inventory, slotIndex, data.button === InputButton.Right);
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
					this.AddButtonToDragOver(button, inventory, slotIndex, rightClick);
				}
			}),
		];
	}

	/**
	 * Cleans up the click pickup state, destroying the visual and clearing connections
	 * @param skipMoveBack If true, skips moving the item back to inventory (used when item is being dropped)
	 */
	private CleanupClickPickupState(skipMoveBack: boolean = false): void {
		if (this.clickPickupState) {
			if (!skipMoveBack) {
				Airship.Inventory.MoveToInventory(
					this.clickPickupState.inventory,
					DESIGNATED_PICKUP_SLOT,
					this.clickPickupState.inventory,
					this.clickPickupState.amount,
				);
			}
			this.clickPickupBin.Clean();
			this.clickPickupState = undefined;
		}
		this.draggingBin.Clean();

		this.CancelDoubleClickTimer();
	}

	/**
	 * Cancels the double-click timer if it exists
	 */
	private CancelDoubleClickTimer(): void {
		if (this.doubleClickTimerCancel) {
			this.doubleClickTimerCancel();
			this.doubleClickTimerCancel = undefined;
		}
	}

	/**
	 * Starts a timer to detect double-click for merge-all functionality
	 */
	private StartDoubleClickTimer(): void {
		this.CancelDoubleClickTimer();

		// Start new timer
		this.doubleClickTimerCancel = SetTimeout(DOUBLE_CLICK_MERGE_DELAY, () => {
			this.doubleClickTimerCancel = undefined;
		});
	}

	/**
	 * Merges all items of the same type from other slots into the pickup item.
	 */
	private DoubleClickMerge(): void {
		if (!this.clickPickupState) return;

		const inventory = this.clickPickupState.inventory;
		const itemType = this.clickPickupState.itemType;
		const pickupStack = inventory.GetItem(DESIGNATED_PICKUP_SLOT);
		if (!pickupStack || pickupStack.itemType !== itemType) return;

		const pickupMaxStackSize = pickupStack.GetMaxStackSize();
		const pickupSpaceAvailable = pickupMaxStackSize - pickupStack.amount;
		if (pickupSpaceAvailable <= 0) return;

		const externalInventory = this.externalInventory;
		const localInventory = Airship.Inventory.localInventory;

		// Helper function to check if we should stop merging
		const ShouldStop = (): boolean => {
			const currentPickupStack = inventory.GetItem(DESIGNATED_PICKUP_SLOT);
			if (!currentPickupStack) return true;
			const maxStackSize = currentPickupStack.GetMaxStackSize();
			return currentPickupStack.amount >= maxStackSize;
		};

		// Helper function to merge from a source slot into the pickup slot
		const MergeFromSlot = (sourceInventory: Inventory, sourceSlot: number): void => {
			if (sourceSlot === DESIGNATED_PICKUP_SLOT || ShouldStop()) return;

			const sourceItem = sourceInventory.GetItem(sourceSlot);
			if (!sourceItem || sourceItem.itemType !== itemType) return;

			const currentPickupStack = inventory.GetItem(DESIGNATED_PICKUP_SLOT);
			if (!currentPickupStack) return;

			const maxStackSize = currentPickupStack.GetMaxStackSize();
			const spaceAvailable = maxStackSize - currentPickupStack.amount;
			if (spaceAvailable <= 0) return;

			const amountToMerge = math.min(sourceItem.amount, spaceAvailable);
			if (amountToMerge <= 0) return;

			Airship.Inventory.MoveToSlot(sourceInventory, sourceSlot, inventory, DESIGNATED_PICKUP_SLOT, amountToMerge);

			const updatedPickupStack = inventory.GetItem(DESIGNATED_PICKUP_SLOT);
			if (updatedPickupStack && this.clickPickupState) {
				this.clickPickupState.amount = updatedPickupStack.amount;
				this.UpdatePickupAmount(updatedPickupStack.amount);
			}
		};

		// Helper function to process which slots to merge based on priority
		const ProcessPriority = (
			targetInventory: Inventory,
			isBackpack: boolean | undefined,
			isNotFull: boolean,
		): void => {
			if (!targetInventory) return;

			const isExternal = targetInventory === externalInventory;

			for (let slot = 0; slot < targetInventory.GetMaxSlots(); slot++) {
				if (slot === DESIGNATED_PICKUP_SLOT || ShouldStop()) break;

				const slotItem = targetInventory.GetItem(slot);
				if (!slotItem || slotItem.itemType !== itemType) continue;

				const slotMaxStackSize = slotItem.GetMaxStackSize();
				const slotSpaceAvailable = slotMaxStackSize - slotItem.amount;
				const slotIsNotFull = slotSpaceAvailable > 0;

				if (isExternal) {
					if (slotIsNotFull === isNotFull) {
						MergeFromSlot(targetInventory, slot);
						if (ShouldStop()) break;
					}
				} else {
					const slotIsBackpack = slot >= this.hotbarSlots;
					if (slotIsBackpack === isBackpack && slotIsNotFull === isNotFull) {
						MergeFromSlot(targetInventory, slot);
						if (ShouldStop()) break;
					}
				}
			}
		};

		// Merge in priority order: external not full, local backpack not full, local hotbar not full,
		// then external full, local backpack full, local hotbar full
		if (externalInventory) {
			ProcessPriority(externalInventory, undefined, true);
		}
		if (localInventory) {
			ProcessPriority(localInventory, true, true);
			ProcessPriority(localInventory, false, true);
		}
		if (externalInventory) {
			ProcessPriority(externalInventory, undefined, false);
		}
		if (localInventory) {
			ProcessPriority(localInventory, true, false);
			ProcessPriority(localInventory, false, false);
		}

		const finalPickupStack = inventory.GetItem(DESIGNATED_PICKUP_SLOT);
		if (!finalPickupStack || finalPickupStack.amount <= 0) {
			this.CleanupClickPickupState();
		} else if (this.clickPickupState) {
			this.clickPickupState.amount = finalPickupStack.amount;
			this.UpdatePickupAmount(finalPickupStack.amount);
		}
	}

	/**
	 * Creates a visual clone of an item that follows the mouse cursor for pickup/drag operations
	 * @param sourceButton The button to clone the visual from
	 * @returns The RectTransform of the cloned visual
	 */
	private CreatePickupVisual(sourceButton: Button): { itemAmountText?: TMP_Text; itemAmountImage?: Image } {
		this.clickPickupBin.Clean();
		const clone = Object.Instantiate(sourceButton.transform.parent.gameObject, this.backpackCanvas.transform);
		const tileComponent = clone.gameObject.GetAirshipComponent<AirshipInventoryTile>();
		const backgroundImage = tileComponent?.button.GetComponent<Image>();
		if (backgroundImage) {
			backgroundImage.enabled = false;
		}
		if (tileComponent && tileComponent.slotNumberText) {
			tileComponent.slotNumberText.enabled = false;
		}
		if (tileComponent && tileComponent.itemImage) {
			tileComponent.itemImage.raycastTarget = false;
		}

		const innerClone = clone.transform.GetChild(0).gameObject;
		innerClone.transform.SetAsLastSibling();
		const cloneRect = innerClone.GetComponent<RectTransform>()!;
		cloneRect.sizeDelta = new Vector2(100, 100);

		const cloneTransform = innerClone.GetComponent<RectTransform>()!;
		cloneTransform.position = Mouse.GetPositionVector3();

		this.clickPickupBin.Add(
			OnUpdate.Connect((dt) => {
				cloneTransform.position = Mouse.GetPositionVector3();
			}),
		);

		this.clickPickupBin.Add(() => {
			Object.Destroy(clone.gameObject);
		});

		return { itemAmountText: tileComponent?.itemAmount, itemAmountImage: tileComponent?.itemImage };
	}

	private UpdatePickupAmount(newAmount: number, textOnly?: boolean): void {
		if (!this.clickPickupState) return;
		if (!textOnly) {
			this.clickPickupState.amount = newAmount;
		}

		if (!this.clickPickupState.itemAmountImage || !this.clickPickupState.itemAmountText) return;
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

	private LoadItemSprite(imageSrc: string | undefined): Sprite | undefined {
		if (!imageSrc) return undefined;
		const spritePath = StringUtils.endsWith(imageSrc, ".sprite") ? imageSrc : imageSrc + ".sprite";
		return Asset.LoadAssetIfExists<Sprite>(spritePath);
	}

	/**
	 * This function handles swapping item stacks when placing a picked up item on a slot with a different item type.
	 */
	private HandleItemStackSwap(targetInventory: Inventory, targetSlotIndex: number, sourceButton: Button): boolean {
		if (!this.clickPickupState) return false;

		const originalAmount = this.clickPickupState.amount;
		const localInventory = Airship.Inventory.localInventory;
		const { itemAmountText, itemAmountImage } = this.CreatePickupVisual(sourceButton);

		// Move the picked-up item to the target slot (this swaps with what's there)
		Airship.Inventory.MoveToSlot(
			this.clickPickupState.inventory,
			DESIGNATED_PICKUP_SLOT,
			targetInventory,
			targetSlotIndex,
			originalAmount,
		);

		// If swapping between external and local inventory, move swapped item to local pickup slot
		const isActuallyExternalToLocal = targetInventory === localInventory;
		let swappedItemMovedToLocal = false;
		if (localInventory && this.clickPickupState.inventory !== localInventory && isActuallyExternalToLocal) {
			const swappedItem = this.clickPickupState.inventory.GetItem(DESIGNATED_PICKUP_SLOT);
			if (swappedItem) {
				Airship.Inventory.MoveToSlot(
					this.clickPickupState.inventory,
					DESIGNATED_PICKUP_SLOT,
					localInventory,
					DESIGNATED_PICKUP_SLOT,
					swappedItem.amount,
				);
				swappedItemMovedToLocal = true;
			}
		}

		const inventoryToCheck = swappedItemMovedToLocal && localInventory ? localInventory : this.clickPickupState.inventory;
		const swappedItem = inventoryToCheck.GetItem(DESIGNATED_PICKUP_SLOT);
		if (!swappedItem) {
			this.CleanupClickPickupState();
			return false;
		}

		this.clickPickupState = {
			inventory: inventoryToCheck,
			slot: DESIGNATED_PICKUP_SLOT,
			itemType: swappedItem.itemType,
			amount: swappedItem.amount,
			itemAmountText: itemAmountText,
			itemAmountImage: itemAmountImage,
			swapStack: true,
			initialClickFlag: false,
		};
		return true;
	}

	/**
	 * This function handles merging a picked-up item stack with an existing stack of the same type.
	 */
	private HandleItemStackMerge(
		targetInventory: Inventory,
		targetSlotIndex: number,
		existingItemStack: ItemStack,
	): void {
		if (!this.clickPickupState) return;

		const maxStackSize = existingItemStack.GetMaxStackSize();
		const spaceAvailable = maxStackSize - existingItemStack.amount;
		const amountToAdd = math.min(spaceAvailable, this.clickPickupState.amount);

		Airship.Inventory.MoveToSlot(
			this.clickPickupState.inventory,
			DESIGNATED_PICKUP_SLOT,
			targetInventory,
			targetSlotIndex,
			amountToAdd,
		);

		this.UpdatePickupAmount(this.clickPickupState.amount - amountToAdd);

		if (this.clickPickupState.amount <= 0) {
			this.CleanupClickPickupState();
		}
	}

	/**
	 * This function handles picking up an item from a slot.
	 */
	private HandleItemPickup(
		inventory: Inventory,
		slotIndex: number,
		itemStack: ItemStack,
		button: Button,
		pointerButton: PointerButton,
	): void {
		const isFullPickup = pointerButton === PointerButton.LEFT || itemStack.amount <= 1;
		const pickupAmount = isFullPickup ? itemStack.amount : math.ceil(itemStack.amount / 2);

		const { itemAmountText, itemAmountImage } = this.CreatePickupVisual(button);
		this.clickPickupState = {
			inventory,
			slot: slotIndex,
			itemType: itemStack.itemType,
			amount: pickupAmount,
			itemAmountText: itemAmountText,
			itemAmountImage: itemAmountImage,
			halfStack: !isFullPickup,
			initialClickFlag: true,
		};

		this.isInitialPickupPhase = true;
		Airship.Inventory.MoveToSlot(inventory, slotIndex, inventory, DESIGNATED_PICKUP_SLOT, pickupAmount);

		if (!isFullPickup) {
			this.UpdatePickupAmount(pickupAmount);
		}

		// Start double-click timer for merge-all functionality
		this.StartDoubleClickTimer();
	}

	/**
	 * This function handles placing a single item from the picked-up stack.
	 */
	private HandleSingleItemPlacement(
		targetInventory: Inventory,
		targetSlotIndex: number,
		existingItemStack: ItemStack | undefined,
		sourceButton: Button,
	): void {
		if (!this.clickPickupState) return;

		if (existingItemStack) {
			// Try to merge one item if same type and not full
			if (existingItemStack.itemType === this.clickPickupState.itemType) {
				const maxStackSize = existingItemStack.GetMaxStackSize();
				if (existingItemStack.amount < maxStackSize) {
					Airship.Inventory.MoveToSlot(
						this.clickPickupState.inventory,
						DESIGNATED_PICKUP_SLOT,
						targetInventory,
						targetSlotIndex,
						1,
					);
					this.UpdatePickupAmount(this.clickPickupState.amount - 1);

					if (this.clickPickupState) {
						this.clickPickupState.initialClickFlag = false;
					}

					if (this.clickPickupState.amount <= 0) {
						this.CleanupClickPickupState();
					}
				}
			} else {
				// Different item type - swap stacks
				this.HandleItemStackSwap(targetInventory, targetSlotIndex, sourceButton);
			}
		} else {
			// Empty slot - place one item
			Airship.Inventory.MoveToSlot(
				this.clickPickupState.inventory,
				DESIGNATED_PICKUP_SLOT,
				targetInventory,
				targetSlotIndex,
				1,
			);
			this.UpdatePickupAmount(this.clickPickupState.amount - 1);

			if (this.clickPickupState.amount <= 0) {
				this.CleanupClickPickupState();
			}
		}
	}

	/**
	 * Updates the visual display of a tile with an item stack
	 */
	private UpdateTile(tile: AirshipInventoryTile, slot: number, itemStack: ItemStack | undefined): void {
		if (slot < 0) return;

		if (tile.slotNumberText !== undefined) {
			if (slot < this.hotbarSlots) {
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

		const sprite = this.LoadItemSprite(itemStack.itemDef.image);
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
		tile.itemAmount.SetText(amountText);
	}

	/**
	 * Updates a tile to show a drag preview
	 * @param tile The tile component to update
	 * @param slot The slot number
	 * @param draggedItemType The item type being dragged
	 * @param previewAmount The amount that would be dropped into this slot
	 * @param currentItemInSlot The current item in the slot
	 * @param updateAmountOnly If true, only updates the amount text without changing image/name
	 */
	private UpdateDraggedPreviewTile(
		tile: AirshipInventoryTile,
		slot: number,
		draggedItemType: string,
		previewAmount: number,
		currentItemInSlot: ItemStack | undefined,
		updateAmountOnly?: boolean,
	): void {
		if (slot < 0) return;

		const previewTotalAmount =
			currentItemInSlot && currentItemInSlot.itemType === draggedItemType
				? currentItemInSlot.amount + previewAmount
				: previewAmount;

		if (!updateAmountOnly) {
			const itemDef = Airship.Inventory.GetItemDef(draggedItemType);
			const sprite = this.LoadItemSprite(itemDef.image);
			if (sprite) {
				tile.itemImage.sprite = sprite;
				tile.itemImage.enabled = true;
				tile.itemName.enabled = false;
			} else {
				tile.itemName.text = itemDef.displayName;
				tile.itemName.enabled = true;
				tile.itemImage.enabled = false;
			}
		}

		tile.itemAmount.enabled = true;
		const amountText = previewTotalAmount > 1 ? previewTotalAmount + "" : "";
		tile.itemAmount.SetText(amountText);
	}

	/**
	 * Hooks up split stack when dragging a picked up item across slots
	 */
	private BeginDragWithPickedUpItem(
		button: Button | undefined,
		inventory: Inventory | undefined,
		slotIndex: number | undefined,
		rightClick: boolean,
	): void {
		if (!this.clickPickupState || this.isInitialPickupPhase || this.isDraggingPickedUpItem) return;

		this.isDraggingPickedUpItem = true;
		this.clickPickupState.isRightClickDrag = rightClick;
		this.draggedOverSlots.clear();

		// Add the initial button/slot where the drag started
		if (button !== undefined && inventory !== undefined && slotIndex !== undefined) {
			const dragEvent = Airship.Inventory.onInventorySlotDragBegin.Fire(
				new CancellableInventorySlotInteractionEvent(inventory, slotIndex),
			);
			if (dragEvent.IsCancelled()) return;
			this.AddButtonToDragOver(button, inventory, slotIndex, rightClick);
		}
	}

	/**
	 * Cancels drag previews and restores all previewed tiles to their actual state
	 */
	private CancelDragPreviews(): void {
		// Restore all previewed tiles to show actual items
		let consumed = false;
		if (this.clickPickupState && this.draggedOverSlots.size() > 0) {
			consumed = true;
			for (const [targetInventory, slots] of this.draggedOverSlots) {
				for (const draggedOverSlot of slots) {
					const tile = this.GetTileForSlot(targetInventory, draggedOverSlot);
					if (tile) {
						const itemInSlot = targetInventory.GetItem(draggedOverSlot);
						this.UpdateTile(tile, draggedOverSlot, itemInSlot);
					}
				}
			}
		}

		// Reset drag state
		this.isDraggingPickedUpItem = false;
		this.draggedOverSlots.clear();
		this.dragAmountToAdd = 0;
		Airship.Inventory.onInventorySlotDragEnd.Fire(
			new SlotDragEndedEvent(
				this.clickPickupState?.inventory ?? Airship.Inventory.localInventory!,
				DESIGNATED_PICKUP_SLOT,
				consumed,
			),
		);
		this.draggingBin.Clean();
	}

	/**
	 * Cleans up the drag operation when the picked up item is dropped
	 */
	private EndDragWithPickedUpItem(): void {
		if (this.isInitialPickupPhase || !this.isDraggingPickedUpItem || !this.clickPickupState) return;
		this.isDraggingPickedUpItem = false;
		if (this.dragAmountToAdd > 0) {
			for (const [targetInventory, slots] of this.draggedOverSlots) {
				for (const draggedOverSlot of slots) {
					Airship.Inventory.MoveToSlot(
						this.clickPickupState.inventory,
						DESIGNATED_PICKUP_SLOT,
						targetInventory,
						draggedOverSlot,
						this.dragAmountToAdd,
					);
				}
			}
		}

		for (const [targetInventory, slots] of this.draggedOverSlots) {
			for (const draggedOverSlot of slots) {
				const tile = this.GetTileForSlot(targetInventory, draggedOverSlot);
				if (tile) {
					const itemInSlot = targetInventory.GetItem(draggedOverSlot);
					this.UpdateTile(tile, draggedOverSlot, itemInSlot);
				}
			}
		}

		if (this.clickPickupState) {
			const remainingStack = this.clickPickupState.inventory.GetItem(DESIGNATED_PICKUP_SLOT);
			if (remainingStack) {
				this.UpdatePickupAmount(remainingStack.amount, false);
			} else {
				this.CleanupClickPickupState();
			}
		}

		this.draggedOverSlots.clear();
		this.draggingBin.Clean();
	}

	private AddButtonToDragOver(button: Button, inventory: Inventory, slotIndex: number, rightClick: boolean): void {
		if (!this.clickPickupState) {
			return;
		}

		const slotsForInventory = this.draggedOverSlots.get(inventory);
		const existing = slotsForInventory?.has(slotIndex) ?? false;
		if (existing) {
			return;
		}

		let currentTotalSlots = 0;
		for (const slots of this.draggedOverSlots.values()) {
			currentTotalSlots += slots.size();
		}

		const maxSlots = this.clickPickupState.amount;
		if (currentTotalSlots >= maxSlots) {
			return;
		}

		const itemInSlotIndex = inventory.GetItem(slotIndex);
		if (itemInSlotIndex?.itemType === this.clickPickupState.itemType || itemInSlotIndex === undefined) {
			if (!slotsForInventory) {
				this.draggedOverSlots.set(inventory, new Set<number>());
			}
			this.draggedOverSlots.get(inventory)!.add(slotIndex);
			this.AddDropPreview(button, inventory, slotIndex, rightClick);
		}
	}

	private AddDropPreview(button: Button, inventory: Inventory, slotIndex: number, rightClick: boolean): void {
		if (!this.clickPickupState || this.draggedOverSlots.size() === 0) {
			return;
		}

		// Calculate total number of dragged slots across all inventories
		let totalDraggedSlots = 0;
		for (const slots of this.draggedOverSlots.values()) {
			totalDraggedSlots += slots.size();
		}

		// Calculate how many items we should drop to each slot depending on click direction
		const currentStackSize = this.clickPickupState.amount;
		const amountToDropToEachSlot = rightClick ? 1 : math.max(1, math.floor(currentStackSize / totalDraggedSlots));

		this.dragAmountToAdd = amountToDropToEachSlot;

		// Update the visual clone amount by how many items we "Drop"
		const totalAmountToDrop = amountToDropToEachSlot * totalDraggedSlots;
		const remainingAmount = math.max(0, currentStackSize - totalAmountToDrop);
		this.UpdatePickupAmount(remainingAmount, true);

		// Update all hovered slots with preview amounts
		for (const [targetInventory, slots] of this.draggedOverSlots) {
			for (const draggedOverSlot of slots) {
				const draggedOverTile = this.GetTileForSlot(targetInventory, draggedOverSlot);
				if (!draggedOverTile) {
					warn("Missing AirshipInventoryTile component when adding drop preview: " + draggedOverSlot);
					continue;
				}
				const currentItemInSlot = targetInventory.GetItem(draggedOverSlot);
				// Only set image/name for the newly added slot, update amount for others
				const isNewSlot = draggedOverSlot === slotIndex && targetInventory === inventory;
				this.UpdateDraggedPreviewTile(
					draggedOverTile,
					draggedOverSlot,
					this.clickPickupState.itemType,
					amountToDropToEachSlot,
					currentItemInSlot,
					!isNewSlot,
				);
			}
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
		this.draggingBin.Add(() => {
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
	 * Gets the tile component for a slot in a given inventory
	 * @param inventory The inventory the slot belongs to
	 * @param slot The slot index
	 * @returns The tile component, or undefined if not found
	 */
	private GetTileForSlot(inventory: Inventory, slot: number): AirshipInventoryTile | undefined {
		if (inventory === this.externalInventory) {
			return this.slotToExternalInventoryTileComponentMap.get(slot);
		} else if (inventory === Airship.Inventory.localInventory) {
			return this.slotToBackpackTileComponentMap.get(slot);
		}
		return undefined;
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

	/**
	 * Tries to find a slot in the target inventory that can merge with the given item stack
	 */
	private FindMergeableSlot(
		targetInventory: Inventory,
		itemStack: ItemStack,
		startSlot: number,
		endSlot: number,
	): number {
		for (let i = startSlot; i < endSlot; i++) {
			const existingItem = targetInventory.GetItem(i);
			if (existingItem && existingItem.itemType === itemStack.itemType) {
				const maxStackSize = existingItem.GetMaxStackSize();
				if (existingItem.amount + itemStack.amount <= maxStackSize) {
					return i;
				}
			}
		}
		return -1;
	}

	/**
	 * Tries to find an empty slot in the target inventory
	 */
	private FindEmptySlot(targetInventory: Inventory, startSlot: number, endSlot: number): number {
		for (let i = startSlot; i < endSlot; i++) {
			if (targetInventory.GetItem(i) === undefined) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * Handles quick-moving an item from external inventory to local inventory
	 * Priority: hotbar merge -> backpack merge -> hotbar empty -> backpack empty
	 */
	private QuickMoveFromExternalToLocal(
		sourceInventory: Inventory,
		sourceSlot: number,
		itemStack: ItemStack,
		localInventory: Inventory,
	): void {
		// Try to merge in hotbar first
		const hotbarMergeSlot = this.FindMergeableSlot(localInventory, itemStack, 0, this.hotbarSlots);
		if (hotbarMergeSlot !== -1) {
			Airship.Inventory.MoveToSlot(
				sourceInventory,
				sourceSlot,
				localInventory,
				hotbarMergeSlot,
				itemStack.amount,
			);
			return;
		}

		// Try to merge in backpack
		const backpackMergeSlot = this.FindMergeableSlot(
			localInventory,
			itemStack,
			this.hotbarSlots,
			localInventory.GetMaxSlots(),
		);
		if (backpackMergeSlot !== -1) {
			Airship.Inventory.MoveToSlot(
				sourceInventory,
				sourceSlot,
				localInventory,
				backpackMergeSlot,
				itemStack.amount,
			);
			return;
		}

		// Try to find empty slot in hotbar
		const hotbarEmptySlot = this.FindEmptySlot(localInventory, 0, this.hotbarSlots);
		if (hotbarEmptySlot !== -1) {
			Airship.Inventory.MoveToSlot(
				sourceInventory,
				sourceSlot,
				localInventory,
				hotbarEmptySlot,
				itemStack.amount,
			);
			return;
		}

		// Try to find empty slot in backpack
		const backpackEmptySlot = this.FindEmptySlot(localInventory, this.hotbarSlots, localInventory.GetMaxSlots());
		if (backpackEmptySlot !== -1) {
			Airship.Inventory.MoveToSlot(
				sourceInventory,
				sourceSlot,
				localInventory,
				backpackEmptySlot,
				itemStack.amount,
			);
		}
	}

	/**
	 * Handles quick-moving an item slot using shift-click
	 * Supports moving between external and local inventories, or within local inventory
	 */
	private QuickMoveSlot(inventory: Inventory, slot: number) {
		const stack = inventory.GetItem(slot);
		if (!stack) return;

		const localInventory = Airship.Inventory.localInventory;
		const isFromExternal = this.externalInventory && inventory === this.externalInventory;
		const isFromLocal = localInventory && inventory === localInventory;

		// Handle movement between external and local inventory
		if (this.externalInventory && localInventory) {
			if (isFromExternal) {
				this.QuickMoveFromExternalToLocal(inventory, slot, stack, localInventory);
			} else if (isFromLocal) {
				const shouldQuickMove = Airship.Input.IsDown(CoreAction.InventoryQuickMoveModifierKey);
				const freeSlot = shouldQuickMove
					? this.externalInventory.FindMergeableSlotWithItemType(stack.itemType) ??
					  this.externalInventory.GetFirstOpenSlot()
					: this.externalInventory.GetFirstOpenSlot();
				if (freeSlot !== -1) {
					Airship.Inventory.MoveToSlot(inventory, slot, this.externalInventory, freeSlot, stack.amount);
				}
			}
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
					if (direction !== PointerDirection.UP || this.isDraggingPickedUpItem) return;

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
						if (direction !== PointerDirection.UP || this.isDraggingPickedUpItem) return;

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
