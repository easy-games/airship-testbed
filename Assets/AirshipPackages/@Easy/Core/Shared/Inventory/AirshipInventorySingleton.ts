import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Singleton } from "@Easy/Core/Shared/Flamework";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Asset } from "../Asset";
import { Game } from "../Game";
import { ItemDef } from "../Item/ItemDefinitionTypes";
import { NetworkFunction } from "../Network/NetworkFunction";
import { Bin } from "../Util/Bin";
import { Signal, SignalPriority } from "../Util/Signal";
import AirshipInventoryUI from "./AirshipInventoryUI";
import Inventory, { InventoryDto, InventoryModifyPermission } from "./Inventory";
import { InventoryUIVisibility } from "./InventoryUIVisibility";
import { ItemStack } from "./ItemStack";
import { InventoryMovingToSlotEvent } from "./Signal/MovingToSlotEvent";
import {
	CancellableInventorySlotInteractionEvent,
	SlotDragEndedEvent,
	InventorySlotMouseClickEvent as InventorySlotMouseClickEvent,
	InventoryEvent,
} from "./Signal/SlotInteractionEvent";

interface InventoryEntry {
	Inv: Inventory;
	Viewers: Set<number>;
	Owners: Set<number>;
}

type ItemDefRegistration = Omit<ItemDef, "internalId" | "itemType">;

const itemDefinitions: {
	[key: string]: Omit<ItemDef, "internalId" | "itemType">;
} = {};

@Singleton()
export class AirshipInventorySingleton {
	public localInventory?: Inventory;
	public localInventoryChanged = new Signal<Inventory>();

	/**
	 * Invoked when an inventory slot move is requested
	 *
	 * Can be used to cancel inventory transfers in certain situations e.g: non-tradeable items, or non-droppable items
	 */
	public readonly onMovingToSlot = new Signal<InventoryMovingToSlotEvent>();

	/**
	 * Event that is invoked when the inventory slot is clicked on the client
	 *
	 * Can be used to implement custom inventory functionality, e.g. "quick move" on shift left-click:
	 * ```ts
	 * Airship.Inventory.onInventorySlotClicked.Connect((event) => {
	 * 	if (event.button === PointerButton.LEFT && Keyboard.IsKeyDown(Key.LeftShift)) {
	 *			Airship.Inventory.QuickMoveSlot(event.inventory, event.slotIndex);
	 *		}
	 * });
	 * ```
	 *
	 * @client Client-only event
	 */
	public readonly onInventorySlotClicked = new Signal<InventorySlotMouseClickEvent>();
	/**
	 * Event that's invoked if there's a drag requested on a given inventory slot
	 *
	 * - You can cancel dragging through this event
	 * - To listen for the drag end - use {@link onInventorySlotDragEnd}
	 * - To listen for a slot being dropped on another slot - use {@link onMovingToSlot}.
	 * @client Client-only event
	 */
	public readonly onInventorySlotDragBegin = new Signal<CancellableInventorySlotInteractionEvent>();
	/**
	 * Event that's invoked if a slot that's being dragged, is no longer being dragged
	 * - `consume` on the event will be true if it is dropping on another slot, that can be handled via {@link onMovingToSlot}.
	 * @client Client-only event
	 */
	public readonly onInventorySlotDragEnd = new Signal<SlotDragEndedEvent>();

	/**
	 * Event invoked when an inventory is opened on the client
	 * @client Client-only event
	 */
	public readonly onInventoryOpened = new Signal<InventoryEvent>();
	/**
	 * Event invoked when an inventory is closed on the client
	 * @client Client-only event
	 */
	public readonly onInventoryClosed = new Signal<InventoryEvent>();

	/**
	 * If `true`, the Inventory UI will immediately be enabled for the player.
	 *
	 * If `false`, Inventory UI is only shown once receiving an item.
	 *
	 * Defaults to `false`.
	 */
	public uiVisibility = InventoryUIVisibility.WhenHasItems;

	private isUISetup = false;

	private inventoryUIPrefab: GameObject | undefined;

	private inventories = new Map<number, InventoryEntry>();

	private itemTypes: string[] = [];
	private readonly itemAccessories = new Map<string, AccessoryComponent[]>();
	private readonly internalIdToItemType = new Map<number, string>();
	private internalIdCounter = 0;

	public readonly ui: AirshipInventoryUI | undefined;

	// public missingItemAccessory!: AccessoryComponent;

	public remotes = {
		clientToServer: {
			getFullUpdate: new NetworkFunction<[invId: number], InventoryDto | undefined>("GetInventoryUpdate"),
		},
	};

	constructor() {
		Airship.Inventory = this;
	}

	protected OnStart(): void {
		// this.missingItemAccessory = Asset.LoadAsset<AccessoryComponent>(
		// 	"Assets/AirshipPackages/@Easy/Core/Prefabs/Accessories/missing_item.prefab",
		// );

		if (Game.IsClient()) {
			this.StartClient();
		}
		if (Game.IsServer()) {
			this.StartServer();
		}

		if (Game.IsClient()) {
			Game.localPlayer.ObserveCharacter((character) => {
				if (!character || this.isUISetup) return;
				if (character.inventory === undefined) return;

				if (
					this.uiVisibility === InventoryUIVisibility.Always ||
					(this.uiVisibility === InventoryUIVisibility.WhenHasItems &&
						character.inventory.GetAllItems().size() > 0)
				) {
					this.CreateUI();
					return;
				}
				character.inventory.onChanged.Connect(() => {
					if (!this.isUISetup && this.uiVisibility === InventoryUIVisibility.WhenHasItems) {
						this.CreateUI();
					}
				});
			});

			Game.localPlayer.ObserveCharacter((character) => {
				if (character) {
					if (this.localInventory !== character.inventory) {
						this.SetLocalInventory(character.inventory);
					}
				}
			});
		}
	}

	public SetUIVisibility(visibility: InventoryUIVisibility): void {
		this.uiVisibility = visibility;
		if (visibility === InventoryUIVisibility.Never) {
			this.ui?.gameObject.SetActive(false);
			return;
		} else {
			this.ui?.gameObject.SetActive(true);
		}

		// Try to create ui
		if (this.isUISetup) return;
		if (visibility === InventoryUIVisibility.Always) {
			this.CreateUI();
		} else if (visibility === InventoryUIVisibility.WhenHasItems) {
			const inv = Game.localPlayer?.character?.inventory;
			if (inv && inv.GetAllItems().size() > 0) {
				this.CreateUI();
			}
		}
	}

	private CreateUI(): void {
		if (this.isUISetup) return;
		this.isUISetup = true;

		let prefab: GameObject;
		if (this.inventoryUIPrefab) {
			prefab = this.inventoryUIPrefab;
		} else {
			prefab = Asset.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/Inventory/AirshipInventoryUI.prefab");
		}
		const go = Object.Instantiate(prefab);
		const uiComp = go.GetAirshipComponent<AirshipInventoryUI>();
		if (uiComp === undefined) {
			error("Inventory UI was missing an AirshipInventoryUI component.");
		}
		(this.ui as AirshipInventoryUI) = uiComp;
	}

	private StartClient(): void {
		CoreNetwork.ServerToClient.UpdateInventory.client.OnServerEvent((dto) => {
			let inv = this.GetInventory(dto.id);
			inv?.ProcessDto(dto);
		});
		CoreNetwork.ServerToClient.SetInventorySlot.client.OnServerEvent(
			(invId, slot, itemStackDto, clientPredicted) => {
				if (Game.IsHosting()) return;
				const inv = this.GetInventory(invId);
				if (!inv) return;

				const itemStack = itemStackDto !== undefined ? ItemStack.Decode(itemStackDto) : undefined;
				inv.SetItem(slot, itemStack);
			},
		);
		CoreNetwork.ServerToClient.UpdateInventorySlot.client.OnServerEvent((invId, slot, itemType, amount) => {
			const inv = this.GetInventory(invId);
			if (!inv) return;

			let itemStack = inv.GetItem(slot);
			if (itemStack === undefined && itemType !== undefined && amount !== undefined) {
				// The server has the authority on this, so we should trust it.
				itemStack = new ItemStack(itemType);
				inv.SetItem(slot, itemStack);
			}

			if (itemStack === undefined) {
				// Still no item stack!
				return;
			}

			if (amount !== undefined) {
				itemStack.SetAmount(amount, { noNetwork: Game.IsHosting() });
			}

			if (itemType !== undefined) {
				itemStack.SetItemType(itemType);
			}
		});
	}

	private StartServer(): void {
		this.remotes.clientToServer.getFullUpdate.server.SetCallback((player, invId) => {
			const inv = this.GetInventory(invId);
			inv?.StartNetworkingDiffs();
			return inv?.Encode();
		});

		CoreNetwork.ClientToServer.Inventory.SwapSlots.server.OnClientEvent(
			(player, fromInvId, fromSlot, toInvId, toSlot) => {},
		);

		CoreNetwork.ClientToServer.Inventory.MoveToSlot.server.OnClientEvent(
			(player, fromInvId, fromSlot, toInvId, toSlot, amount) => {
				const fromInv = this.GetInventory(fromInvId);
				if (!fromInv) return;

				const toInv = this.GetInventory(toInvId);
				if (!toInv) return;

				if (!fromInv.CanPlayerModifyInventory(player)) {
					warn(`[Inventory] MoveToSlot ${player.username} Cannot Modify Source Inventory`);
					return;
				}

				if (!toInv.CanPlayerModifyInventory(player)) {
					warn(`[Inventory] MoveToSlot ${player.username} Cannot Modify Target Inventory`);
					return;
				}

				const event = this.onMovingToSlot.Fire(
					new InventoryMovingToSlotEvent(fromInv, fromSlot, toInv, toSlot, amount),
				);
				if (event.IsCancelled()) return;
				amount = event.amount;

				const fromItemStack = fromInv.GetItem(fromSlot);
				if (!fromItemStack) return;

				const toItemStack = toInv.GetItem(toSlot);
				if (toItemStack !== undefined) {
					if (toItemStack.CanMerge(fromItemStack)) {
						if (event.allowMerging && toItemStack.amount + amount <= toItemStack.GetMaxStackSize()) {
							toItemStack.SetAmount(toItemStack.amount + amount);
							fromItemStack.Decrement(amount);

							// CoreNetwork.ClientToServer.Inventory.MoveToSlot.client.FireServer(
							// 	fromInv.id,
							// 	fromSlot,
							// 	toInv.id,
							// 	toSlot,
							// 	amount,
							// );
							return;
						}
						// can't merge so do nothing
						return;
					}
				}

				// If < fromItemStack we wanna "split"
				if (amount < fromItemStack.amount) {
					this.MoveAmountToSlot(fromInv, fromSlot, toInv, toSlot, amount, { clientPredicted: true });
				} else {
					this.SwapSlots(fromInv, fromSlot, toInv, toSlot, {
						clientPredicted: true,
					});
				}
			},
		);

		CoreNetwork.ClientToServer.Inventory.QuickMoveSlot.server.OnClientEvent(
			(player, fromInvId, fromSlot, fromHotbarSize, toInvId) => {
				const character = player.character;
				if (!character) return;

				const fromInv = this.GetInventory(fromInvId);
				if (!fromInv) return;

				const toInv = this.GetInventory(toInvId);
				if (!toInv) return;

				if (!fromInv.CanPlayerModifyInventory(player)) {
					warn(`[Inventory] QuickMoveSlot ${player.username} Cannot Modify Source Inventory`);
					return;
				}

				if (!toInv.CanPlayerModifyInventory(player)) {
					warn(`[Inventory] QuickMoveSlot ${player.username} Cannot Modify Target Inventory`);
					return;
				}

				const itemStack = fromInv.GetItem(fromSlot);
				if (!itemStack) return;

				if (fromSlot < fromHotbarSize) {
					// move to backpack

					let completed = false;

					// find slots to merge
					for (let i = fromHotbarSize; i < fromInv.GetMaxSlots(); i++) {
						const otherItemStack = fromInv.GetItem(i);
						if (otherItemStack?.CanMerge(itemStack)) {
							if (otherItemStack.amount < otherItemStack.GetMaxStackSize()) {
								let delta = math.min(
									itemStack.amount,
									otherItemStack.GetMaxStackSize() - otherItemStack.amount, // amount free in stack
								);
								otherItemStack.SetAmount(otherItemStack.amount + delta, {
									noNetwork: true,
								});
								itemStack.Decrement(delta, {
									noNetwork: true,
								});
								if (itemStack.IsDestroyed()) {
									completed = true;
									break;
								}
							}
						}
					}

					if (!completed) {
						// find empty slot
						for (let i = fromHotbarSize; i < fromInv.GetMaxSlots(); i++) {
							if (fromInv.GetItem(i) === undefined) {
								this.SwapSlots(fromInv, fromSlot, toInv, i, {
									clientPredicted: true,
								});
								completed = true;
								break;
							}
						}
					}
				} else {
					// move to hotbar

					let completed = false;
					const itemMeta = itemStack.GetMeta();

					// find slots to merge
					for (let i = 0; i < fromHotbarSize; i++) {
						const otherItemStack = fromInv.GetItem(i);
						if (otherItemStack?.CanMerge(itemStack)) {
							if (otherItemStack.amount < otherItemStack.GetMaxStackSize()) {
								let delta = math.max(
									otherItemStack.GetMaxStackSize() - itemStack.amount,
									otherItemStack.GetMaxStackSize() - otherItemStack.amount,
								);
								otherItemStack.SetAmount(otherItemStack.amount + delta, {
									noNetwork: true,
								});
								itemStack.Decrement(delta, {
									noNetwork: true,
								});
								if (itemStack.IsDestroyed()) {
									completed = true;
									break;
								}
							}
						}
					}

					if (!completed) {
						// find empty slot
						for (let i = 0; i < fromHotbarSize; i++) {
							if (fromInv.GetItem(i) === undefined) {
								this.SwapSlots(fromInv, fromSlot, fromInv, i, {
									clientPredicted: true,
								});
								completed = true;
								break;
							}
						}
					}
				}
			},
		);
	}

	private SwapSlots(
		fromInventory: Inventory,
		fromSlot: number,
		toInventory: Inventory,
		toSlot: number,
		config?: {
			clientPredicted: boolean;
		},
	): void {
		const fromItem = fromInventory.GetItem(fromSlot);
		const toItem = toInventory.GetItem(toSlot);

		toInventory.SetItem(toSlot, fromItem, {
			clientPredicted: config?.clientPredicted,
		});
		fromInventory.SetItem(fromSlot, toItem, {
			clientPredicted: config?.clientPredicted,
		});
	}

	private MoveAmountToSlot(
		fromInventory: Inventory,
		fromSlot: number,
		toInventory: Inventory,
		toSlot: number,
		amount: number,
		config?: { clientPredicted: boolean },
	) {
		amount = math.floor(amount); // ensure it's a whole number

		const fromItem = fromInventory.GetItem(fromSlot);
		// const toItem = toInventory.GetItem(toSlot);
		if (fromItem === undefined) return;
		if (amount >= fromItem.amount) {
			return this.SwapSlots(fromInventory, fromSlot, toInventory, toSlot, config);
		}

		fromItem.SetAmount(fromItem.amount - amount);
		toInventory.SetItem(toSlot, new ItemStack(fromItem.itemType, amount), {
			clientPredicted: config?.clientPredicted,
		});
	}

	private GetInvEntry(inventory: Inventory): InventoryEntry {
		const found = this.inventories.get(inventory.id);
		if (found) {
			return found;
		}
		const entry: InventoryEntry = {
			Inv: inventory,
			Viewers: new Set(),
			Owners: new Set(),
		};
		this.inventories.set(inventory.id, entry);
		return entry;
	}

	public GetInventory(id: number): Inventory | undefined {
		return this.inventories.get(id)?.Inv;
	}

	public Subscribe(clientId: number, inventory: Inventory, owner: boolean): void {
		const entry = this.GetInvEntry(inventory);
		if (owner) {
			entry.Owners.add(clientId);
		} else {
			entry.Viewers.add(clientId);
		}
	}

	private Unsubscribe(clientId: number, inventory: Inventory): void {
		const entry = this.GetInvEntry(inventory);
		entry.Owners.delete(clientId);
		entry.Viewers.delete(clientId);
	}

	public RegisterInventory(inventory: Inventory): void {
		const entry: InventoryEntry = {
			Inv: inventory,
			Viewers: new Set(),
			Owners: new Set(),
		};
		this.inventories.set(inventory.id, entry);

		const character = inventory.gameObject.GetAirshipComponent<Character>();
		if (Game.IsClient() && character?.IsInitialized() && character.IsLocalCharacter()) {
			this.SetLocalInventory(inventory);
		}
	}

	public UnregisterInventory(inventory: Inventory): void {
		if (inventory.id === undefined) return;
		this.inventories.delete(inventory.id);
	}

	public QuickMoveSlot(inv: Inventory, slot: number, hotbarSize: number): void {
		const itemStack = inv.GetItem(slot);
		if (!itemStack) return;

		if (slot < hotbarSize) {
			// move to backpack

			let completed = false;

			// find slots to merge
			if (!completed) {
				for (let i = hotbarSize; i < inv.GetMaxSlots(); i++) {
					const otherItemStack = inv.GetItem(i);
					if (otherItemStack?.CanMerge(itemStack)) {
						if (otherItemStack.amount < otherItemStack.GetMaxStackSize()) {
							let delta = math.min(
								itemStack.amount,
								otherItemStack.GetMaxStackSize() - otherItemStack.amount,
							);
							otherItemStack.SetAmount(otherItemStack.amount + delta);
							itemStack.Decrement(delta);
							if (itemStack.IsDestroyed()) {
								completed = true;
								break;
							}
						}
					}
				}
			}

			if (!completed) {
				// find empty slot
				for (let i = hotbarSize; i < inv.GetMaxSlots(); i++) {
					if (inv.GetItem(i) === undefined) {
						this.SwapSlots(inv, slot, inv, i, {
							clientPredicted: RunUtil.IsClient(),
						});
						completed = true;
						break;
					}
				}
			}
		} else {
			// move to hotbar

			let completed = false;
			const itemMeta = itemStack.GetMeta();

			// find slots to merge
			if (!completed) {
				for (let i = 0; i < hotbarSize; i++) {
					const otherItemStack = inv.GetItem(i);
					if (otherItemStack?.CanMerge(itemStack)) {
						if (otherItemStack.amount < otherItemStack.GetMaxStackSize()) {
							let delta = math.max(
								otherItemStack.GetMaxStackSize() - itemStack.amount,
								otherItemStack.GetMaxStackSize() - otherItemStack.amount,
							);
							otherItemStack.SetAmount(otherItemStack.amount + delta);
							itemStack.Decrement(delta);
							if (itemStack.IsDestroyed()) {
								completed = true;
								break;
							}
						}
					}
				}
			}

			if (!completed) {
				// find empty slot
				for (let i = 0; i < hotbarSize; i++) {
					if (inv.GetItem(i) === undefined) {
						this.SwapSlots(inv, slot, inv, i, {
							clientPredicted: RunUtil.IsClient(),
						});
						completed = true;
						break;
					}
				}
			}
		}

		if (Game.IsClient()) {
			CoreNetwork.ClientToServer.Inventory.QuickMoveSlot.client.FireServer(inv.id, slot, hotbarSize, inv.id);
		}

		// SetTimeout(0.1, () => {
		// 	this.CheckInventoryOutOfSync();
		// });
	}

	/**
	 * Will perform a move to slot, but store the item in the best available slot
	 *
	 * This internally uses `MoveToSlot`
	 * @param sourceInventory The inventory to move the stack from
	 * @param sourceSlotIndex The slot index of the stack
	 * @param destinationInventory The destination inventory
	 * @param [canMerge=true] Whether or not to use a merge if there's already the item exising in the target inventory (defaults to true)
	 */
	public MoveToInventory(
		sourceInventory: Inventory,
		sourceSlotIndex: number,
		destinationInventory: Inventory,
		amount?: number,
		canMerge = true,
	) {
		const stackAtSlot = sourceInventory.GetItem(sourceSlotIndex);
		if (!stackAtSlot) return; // there should be an item here, however!

		if (canMerge) {
			const destination =
				destinationInventory.FindMergableSlot(stackAtSlot) ?? destinationInventory.GetFirstOpenSlot();
			if (destination === -1) return;

			return this.MoveToSlot(sourceInventory, sourceSlotIndex, destinationInventory, destination, amount);
		} else {
			const destination = destinationInventory.GetFirstOpenSlot();
			if (destination === -1) return;

			return this.MoveToSlot(sourceInventory, sourceSlotIndex, destinationInventory, destination, amount);
		}
	}

	/**
	 * Moves items or the slot from a source inventory, to a destination inventory slot
	 * @param fromInv The source inventory
	 * @param fromSlot The source inventory slot
	 * @param toInv The destination inventory
	 * @param toSlot The destination inventory slot
	 * @param amount The amount to transfer - will default to the full amount
	 * @returns
	 */
	public MoveToSlot(fromInv: Inventory, fromSlot: number, toInv: Inventory, toSlot: number, amount?: number): void {
		if (!fromInv.CanPlayerModifyInventory(Game.localPlayer) || !toInv.CanPlayerModifyInventory(Game.localPlayer)) {
			return;
		}

		const event = this.onMovingToSlot.Fire(
			new InventoryMovingToSlotEvent(fromInv, fromSlot, toInv, toSlot, amount),
		);
		if (event.IsCancelled() || event.amount < 1) return;

		amount = event.amount;

		const fromItemStack = fromInv.GetItem(fromSlot);
		if (!fromItemStack) return;

		const toItemStack = toInv.GetItem(toSlot);
		if (toItemStack !== undefined) {
			if (toItemStack.CanMerge(fromItemStack)) {
				if (event.allowMerging && toItemStack.amount + amount <= toItemStack.GetMaxStackSize()) {
					toItemStack.SetAmount(toItemStack.amount + amount);
					fromItemStack.Decrement(amount);

					if (Game.IsClient()) {
						CoreNetwork.ClientToServer.Inventory.MoveToSlot.client.FireServer(
							fromInv.id,
							fromSlot,
							toInv.id,
							toSlot,
							amount,
						);
					}
					return;
				}
				// can't merge so do nothing
				return;
			}
		}

		if (amount < fromItemStack.amount) {
			this.MoveAmountToSlot(fromInv, fromSlot, toInv, toSlot, amount, { clientPredicted: true });
		} else {
			this.SwapSlots(fromInv, fromSlot, toInv, toSlot, {
				clientPredicted: true,
			});
		}

		if (Game.IsClient()) {
			CoreNetwork.ClientToServer.Inventory.MoveToSlot.client.FireServer(
				fromInv.id,
				fromSlot,
				toInv.id,
				toSlot,
				amount,
			);
		}
	}

	public SetInventoryUIPrefab(prefab: GameObject): void {
		this.inventoryUIPrefab = prefab;
	}

	public SetLocalInventory(inventory: Inventory): void {
		this.localInventory = inventory;
		this.localInventoryChanged.Fire(inventory);
	}

	public ObserveLocalInventory(
		callback: (inv: Inventory) => CleanupFunc,
		priority: SignalPriority = SignalPriority.NORMAL,
	): Bin {
		const bin = new Bin();
		let cleanup: CleanupFunc;
		if (this.localInventory) {
			task.spawn(() => {
				cleanup = callback(this.localInventory!);
			});
		}

		bin.Add(
			this.localInventoryChanged.ConnectWithPriority(priority, (inv) => {
				task.spawn(() => {
					cleanup = callback(inv);
				});
			}),
		);
		bin.Add(() => {
			cleanup?.();
		});
		return bin;
	}

	public ObserveLocalHeldItem(
		callback: (itemStack: ItemStack | undefined) => CleanupFunc,
		priority: SignalPriority = SignalPriority.NORMAL,
	): Bin {
		const bin = new Bin();

		let cleanup: CleanupFunc;

		const charBin = new Bin();
		bin.Add(
			Game.localPlayer.ObserveCharacter((character) => {
				if (!character) {
					task.spawn(() => (cleanup = callback(undefined)));
					return;
				}
				charBin.Add(
					character.ObserveHeldItem((itemStack) => {
						task.spawn(() => {
							cleanup?.();
							cleanup = callback(itemStack);
						});
					}, priority),
				);
				return () => charBin.Clean();
			}),
		);
		bin.Add(() => {
			charBin.Clean();
			cleanup?.();
		});
		return bin;
	}

	/**********************************/
	/**********************************/
	/**********************************/
	/**********************************/
	/**********************************/
	/**********************************/
	/**********************************/
	/**********************************/

	public RegisterItem(itemType: string, itemDefinition: ItemDefRegistration) {
		itemDefinitions[itemType] = itemDefinition;

		/*********************/

		this.itemTypes.push(itemType);

		const itemMeta = this.GetItemDef(itemType);

		// Assign ID to each ItemType
		itemMeta.itemType = itemType;
		itemMeta.internalId = this.internalIdCounter;
		this.internalIdToItemType.set(this.internalIdCounter, itemType);

		// Map items to accessories
		let accessoryPaths: string[] = [];
		if (itemMeta.accessoryPaths) {
			accessoryPaths = itemMeta.accessoryPaths;
		}

		if (accessoryPaths.size() > 0) {
			const accessories: AccessoryComponent[] = [];
			this.itemAccessories.set(itemType, accessories);

			for (const accessoryName of accessoryPaths) {
				let accessory = AssetBridge.Instance.LoadAssetIfExists<GameObject>(accessoryName);
				if (!accessory) {
					continue;
				}

				const accessoryComponent = accessory.GetComponent<AccessoryComponent>();
				if (!accessoryComponent) {
					error("Missing AccessoryComponent on game object prefab");
				}
				accessories.push(accessoryComponent);
			}
		}
		this.internalIdCounter++;
	}

	public GetItemTypeFromInternalId(internalId: number): string | undefined {
		return this.internalIdToItemType.get(internalId);
	}

	public GetItemDef(itemType: string): ItemDef {
		const val = itemDefinitions[itemType] as ItemDef;
		if (val === undefined) {
			error(
				'ItemType "' +
					itemType +
					'" was missing an ItemDefinition. Please register the ItemType with Airship.Inventory.RegisterItem()',
			);
		}
		return val;
	}

	public GetFirstAccessoryForItemType(itemType: string): AccessoryComponent | undefined {
		let accessories = this.itemAccessories.get(itemType);
		if (accessories) return accessories[0];

		return undefined;
	}

	public GetAccessoriesForItemType(itemType: string): Readonly<AccessoryComponent[]> {
		let accessories = this.itemAccessories.get(itemType);
		if (accessories) return accessories;

		return [];
	}

	public IsItemType(s: string): boolean {
		return itemDefinitions[s as string] !== undefined;
	}

	public GetItemTypes(): string[] {
		return this.itemTypes;
	}

	/**
	 * Find an `ItemType` from the given string, first trying direct then case-insensitive searching the items
	 * @param expression The string expression to search for
	 * @returns The `ItemType` (if found) - otherwise `undefined`.
	 */
	public FindItemTypeFromExpression(expression: string): string | undefined {
		if (itemDefinitions[expression] !== undefined) return expression as string;

		// 	Explicit find
		for (const [key] of pairs(itemDefinitions)) {
			if ((key as string).lower() === expression.lower()) {
				return key as string;
			}
		}

		return undefined;
	}

	/**
	 * Opens an external inventory alongside the user's inventory
	 *
	 * Note: If you want to check the user has permissions - use {@link Inventory.CanPlayerModifyInventory} first - inventory permissions can be obtained via {@link Inventory.GetModifyPermission}
	 *
	 * @param inventory The external inventory to open
	 * @param onExternalInventoryClose An optional handler for when the external inventory closes
	 * @returns A function to close the inventory, or `undefined` if it was unable to open
	 */
	public OpenExternalInventory(inventory: Inventory, onExternalInventoryClose?: () => void) {
		assert(Game.IsClient(), "An inventory can only be opened by a client");

		if (!inventory.CanPlayerModifyInventory(Game.localPlayer)) {
			const modifyPermission = inventory.GetModifyPermission();
			switch (modifyPermission) {
				case InventoryModifyPermission.NetworkOwner:
					warn("[OpenExternalInventory] User is not network owner of this inventory");
			}
			return;
		}

		const ui = this.ui;
		if (!ui) {
			return;
		}

		const bin = ui.OpenBackpackWithExternalInventory(inventory);
		if (!bin) {
			return;
		}

		if (typeIs(onExternalInventoryClose, "function")) {
			// We can listen to the closed event for this :-)
			let disconnect = this.onInventoryClosed.Connect((event) => {
				if (event.inventory !== inventory) return;
				onExternalInventoryClose();
				disconnect();
			});
		}

		return () => {
			if (ui.GetActiveExternalInventory() === undefined) return;

			// Close the external inventory
			bin.Clean();

			// Close the main inventory
		};
	}
}
