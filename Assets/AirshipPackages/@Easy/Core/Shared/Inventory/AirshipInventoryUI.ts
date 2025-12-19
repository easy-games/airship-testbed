import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { InventoryHotbarAction } from "@Easy/Core/Shared/Inventory/InventoryHotbarAction";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { Keyboard, Mouse } from "@Easy/Core/Shared/UserInput";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, PointerButton, PointerDirection } from "@Easy/Core/Shared/Util/CanvasAPI";
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

	private slotToBackpackTileMap = new Map<number, GameObject>();
	private slotToExternalInventoryTileMap = new Map<number, GameObject>();
	private buttonToSlotIndexMap = new Map<Button, number>();

	private inventoryEnabled = true;
	private visible = false;
	private backpackEnabled = true;

	@NonSerialized() public draggingState: DraggingState | undefined;
	private draggingBin = new Bin();

	private clickPickupState: ClickPickupState | undefined;
	private clickPickupBin = new Bin();

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
		if (Game.IsEditor()) {
			Airship.Inventory.RegisterItem("TestItem", {
				displayName: "Test Item",
				maxStackSize: 10000,
				image: "Assets/AirshipPackages/@Easy/Core/Prefabs/EmoteImages/HandsUp.png",
			});
			Airship.Inventory.RegisterItem("TestItem2", {
				displayName: "Test Item 2",
				maxStackSize: 10000,
				image: "Assets/AirshipPackages/@Easy/Core/Prefabs/EmoteImages/EmoteWave.png",
			});
			Airship.Characters.ObserveCharacters((character) => {
				character.inventory?.AddItem(new ItemStack("TestItem", 1001));
				character.inventory?.AddItem(new ItemStack("TestItem2", 1001));
			});

			// task.delay(2, () => {
			// 	this.TestMergeFunctionality();
			// });
		}

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
	}

	private TestMergeFunctionality(): void {
		const inventory = Airship.Inventory.localInventory;
		if (!inventory) {
			warn("[Inventory Test] No local inventory found");
			return;
		}

		print("[Inventory Test] Starting merge functionality tests...");

		print("[Inventory Test] Test 1: Adding items to merge with existing stacks");
		inventory.AddItem(new ItemStack("TestItem", 500));
		task.wait(2);

		print("[Inventory Test] Test 2: Adding items that exceed max stack size");
		inventory.AddItem(new ItemStack("TestItem", 17000));
		task.wait(2);

		print("[Inventory Test] Test 3: Adding items to partially filled slots");
		inventory.AddItem(new ItemStack("TestItem", 2000));
		task.wait(2);

		print("[Inventory Test] Test 4: Testing MoveToSlot with merge");
		const slot0 = inventory.GetItem(0);
		const slot1 = inventory.GetItem(1);
		if (slot0 && slot1 && slot0.itemType === slot1.itemType) {
			const amountToMove = math.min(10000, slot0.amount);
			Airship.Inventory.MoveToSlot(inventory, 0, inventory, 1, amountToMove);
		}
		task.wait(2);
		print("[Inventory Test] Test 5: Testing QuickMoveSlot merge");
		if (inventory.GetItem(0)) {
			Airship.Inventory.QuickMoveSlot(inventory, 0, 9);
		}
		task.wait(2);

		print("[Inventory Test] Test 6: Testing excess handling with full inventory");
		for (let i = 0; i < 100; i++) {
			inventory.AddItem(new ItemStack("TestItem", 10000));
			task.wait(0.1);
		}
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
		this.backpackOpenBin.Add(() => {
			this.clickPickupBin.Clean();
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
			if (this.clickPickupState && this.clickPickupState.clonedTransform) {
				Object.Destroy(this.clickPickupState.clonedTransform.gameObject);
			}
			this.clickPickupState = undefined;
			this.clickPickupBin.Clean();
		}
	}

	/**
	 * Creates a visual clone of an item that follows the mouse cursor for pickup/drag operations
	 * @param sourceButton The button to clone the visual from
	 * @returns The RectTransform of the cloned visual
	 */
	private CreatePickupVisual(sourceButton: Button): RectTransform {
		this.CleanupClickPickupState();
		const visual = sourceButton.transform.GetChild(0).gameObject;
		const clone = Object.Instantiate(visual, this.backpackCanvas.transform);

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

		return cloneRect;
	}

	private UpdateTile(tile: GameObject, slot: number, itemStack: ItemStack | undefined): void {
		const inv = Airship.Inventory.localInventory;

		const tileComponent = tile.GetAirshipComponent<AirshipInventoryTile>();
		if (!tileComponent) {
			error("Missing AirshipInventoryTile component when updating inventory tile: " + tile.name);
		}

		if (tileComponent.slotNumberText !== undefined) {
			if (slot !== undefined && slot < this.hotbarSlots) {
				// Get the keybind for this hotbar slot
				this.UpdateHotbarSlotKeybindText(tileComponent, slot);
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
		let sprite: Sprite | undefined;
		if (imageSrc) {
			if (!StringUtils.endsWith(imageSrc, ".sprite")) {
				imageSrc += ".sprite";
			}
			sprite = Asset.LoadAssetIfExists<Sprite>(imageSrc);
		}
		if (sprite) {
			tileComponent.itemImage.sprite = sprite;
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

	//TODO: Need to fix this to use MoveToSlot or MoveToInventory so the server can see it.  Just leaving this for now to remind me tomorrow.
	private BindDragEventsOnButton(button: Button, inventory: Inventory, slotIndex: number): EngineEventConnection[] {
		return [
			// Unified handler for both pickup and placement
			CanvasAPI.OnPointerEvent(button.gameObject, (direction, pointerButton) => {
				if (!this.IsBackpackShown()) return;
				if (direction !== PointerDirection.UP) return;

				const targetSlotIndex = this.GetSlotIndexFromButton(button);
				if (targetSlotIndex === undefined) return;
				const existingItemStack = inventory.GetItem(targetSlotIndex);

				// What happens when we have an item picked up already
				if (this.clickPickupState) {
					if (pointerButton === PointerButton.LEFT) {
						if (existingItemStack) {
							// If the item type is the same, we can merge them
							if (existingItemStack.itemType === this.clickPickupState.itemStack.itemType) {
								const maxStackSize = existingItemStack.GetMaxStackSize();
								const spaceAvailable = maxStackSize - existingItemStack.amount;
								const amountToAdd = math.min(spaceAvailable, this.clickPickupState.itemStack.amount);

								if (amountToAdd > 0) {
									existingItemStack.SetAmount(existingItemStack.amount + amountToAdd);
									this.clickPickupState.itemStack.Decrement(amountToAdd);
								}

								// If pickup stack is now empty, clean up
								if (
									this.clickPickupState.itemStack.IsDestroyed() ||
									this.clickPickupState.itemStack.amount <= 0
								) {
									this.CleanupClickPickupState();
								}
							} else {
								// Different item type - swap them
								// Create an item stack copy so we can set the inventory
								const pickupItemStack = new ItemStack(
									this.clickPickupState.itemStack.itemType,
									this.clickPickupState.itemStack.amount,
								);

								const newCloneRect = this.CreatePickupVisual(button);
								this.clickPickupState = {
									inventory,
									slot: this.clickPickupState.slot,
									itemStack: existingItemStack,
									clonedTransform: newCloneRect,
								};
								Airship.Inventory.MoveToInventory(
									inventory,
									this.clickPickupState.slot,
									inventory,
									pickupItemStack.amount,
								);
							}
						} else {
							// Empty slot - place the entire picked-up item into the slot and clear pickup state
							const pickupItemStack = new ItemStack(
								this.clickPickupState.itemStack.itemType,
								this.clickPickupState.itemStack.amount,
							);
							Airship.Inventory.MoveToSlot(
								inventory,
								this.clickPickupState.slot,
								inventory,
								targetSlotIndex,
								pickupItemStack.amount,
							);
							this.CleanupClickPickupState();
						}
					} else if (pointerButton === PointerButton.RIGHT) {
						if (existingItemStack) {
							// Slot has an item - check if we can merge then decrement by 1
							if (existingItemStack.itemType === this.clickPickupState.itemStack.itemType) {
								const maxStackSize = existingItemStack.GetMaxStackSize();
								if (existingItemStack.amount < maxStackSize) {
									existingItemStack.SetAmount(existingItemStack.amount + 1);
									this.clickPickupState.itemStack.Decrement(1);
								}
							} else {
								// Different item type - swap entire pickup stack with existing item
								const pickupItemStack = new ItemStack(
									this.clickPickupState.itemStack.itemType,
									this.clickPickupState.itemStack.amount,
								);

								// Create new pickup state with the existing item
								const newCloneRect = this.CreatePickupVisual(button);
								this.clickPickupState = {
									inventory,
									slot: this.clickPickupState.slot,
									itemStack: existingItemStack,
									clonedTransform: newCloneRect,
								};
								Airship.Inventory.MoveToSlot(
									inventory,
									this.clickPickupState.slot,
									inventory,
									targetSlotIndex,
									pickupItemStack.amount,
								);
							}
						} else {
							// Create a new item stack with 1 and decrement current pickup by 1
							const singleItemStack = new ItemStack(this.clickPickupState.itemStack.itemType, 1);
							Airship.Inventory.MoveToSlot(
								inventory,
								this.clickPickupState.slot,
								inventory,
								targetSlotIndex,
								singleItemStack.amount,
							);
							this.clickPickupState.itemStack.Decrement(1);
						}

						// If the cloned stack is now empty, clean up
						if (this.clickPickupState) {
							const isDestroyed = this.clickPickupState.itemStack.IsDestroyed();
							const amount = this.clickPickupState.itemStack.amount;
							if (isDestroyed || amount <= 0) {
								this.CleanupClickPickupState();
							}
						}
					}
					return;
				}
				// What happens when we don't have an item picked up already
				else {
					if (existingItemStack) {
						this.clickPickupBin.Add(() => {
							if (this.clickPickupState) {
								this.clickPickupState.inventory.AddItem(this.clickPickupState.itemStack);
								this.CleanupClickPickupState();
							}
						});

						if (
							pointerButton === PointerButton.LEFT ||
							(pointerButton === PointerButton.RIGHT && existingItemStack.amount <= 1)
						) {
							const clickPickupEvent = Airship.Inventory.onInventorySlotClickPickup.Fire(
								new InventorySlotClickPickupEvent(inventory, slotIndex),
							);
							if (clickPickupEvent.IsCancelled()) return;
							const cloneRect = this.CreatePickupVisual(button);

							// Create a new ItemStack copy to avoid the reference being destroyed when inventory.Decrement is called
							const pickupItemStack = new ItemStack(existingItemStack.itemType, existingItemStack.amount);
							this.clickPickupState = {
								inventory,
								slot: slotIndex,
								itemStack: pickupItemStack,
								clonedTransform: cloneRect,
							};
							inventory.Decrement(existingItemStack.itemType, existingItemStack.amount);
						} else if (pointerButton === PointerButton.RIGHT) {
							const clickPickupEvent = Airship.Inventory.onInventorySlotClickPickup.Fire(
								new InventorySlotClickPickupEvent(inventory, slotIndex),
							);
							if (clickPickupEvent.IsCancelled()) return;
							const newItemStack = new ItemStack(
								existingItemStack.itemType,
								math.ceil(existingItemStack.amount / 2),
							);
							const cloneRect = this.CreatePickupVisual(button);
							this.clickPickupState = {
								inventory,
								slot: slotIndex,
								itemStack: newItemStack,
								clonedTransform: cloneRect,
							};
							inventory.Decrement(existingItemStack.itemType, newItemStack.amount);
						}
					}
				}
			}),
		];
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
							const tile = this.hotbarContent.GetChild(slot).gameObject;
							const tileComponent = tile.GetAirshipComponent<AirshipInventoryTile>();
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
		if (slot >= this.hotbarContent.childCount) {
			go = Object.Instantiate(this.hotbarTileTemplate, this.hotbarContent);
		} else {
			go = this.hotbarContent.GetChild(slot).gameObject;
		}

		this.UpdateTile(go, slot, itemStack);

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
			const tileComponent = go.GetAirshipComponent<AirshipInventoryTile>()!;
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

			this.slotToExternalInventoryTileMap.set(i, tileGO);

			const tile = tileGO.gameObject.GetAirshipComponentInChildren<AirshipInventoryTile>();
			if (!tile) continue;
			this.buttonToSlotIndexMap.set(tile.button, i);

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
			// Clean up button mappings for external inventory
			for (let i = 0; i < inventory.maxSlots; i++) {
				const tile = this.slotToExternalInventoryTileMap.get(i);
				if (tile) {
					const tileComponent = tile.GetAirshipComponentInChildren<AirshipInventoryTile>();
					if (tileComponent) {
						this.buttonToSlotIndexMap.delete(tileComponent.button);
					}
				}
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
	}
}
