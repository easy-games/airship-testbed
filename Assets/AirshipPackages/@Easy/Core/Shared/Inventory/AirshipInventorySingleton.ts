import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Singleton } from "@Easy/Core/Shared/Flamework";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { AssetCache } from "../AssetCache/AssetCache";
import { Game } from "../Game";
import { ItemDef } from "../Item/ItemDefinitionTypes";
import { NetworkFunction } from "../Network/NetworkFunction";
import { Bin } from "../Util/Bin";
import { Signal } from "../Util/Signal";
import Inventory, { InventoryDto } from "./Inventory";
import { ItemStack } from "./ItemStack";

interface InventoryEntry {
	Inv: Inventory;
	Viewers: Set<number>;
	Owners: Set<number>;
}

type ItemDefRegistration = Omit<ItemDef, "internalId" | "itemType"> & {
	[x: string | number | symbol]: any;
};

const itemDefinitions: {
	[key: string]: Omit<ItemDef, "internalId" | "itemType">;
} = {};

@Singleton()
export class AirshipInventorySingleton {
	public localInventory?: Inventory;
	public localInventoryChanged = new Signal<Inventory>();

	/**
	 * If `true`, the Inventory UI will immediately be enabled for the player.
	 *
	 * If `false`, Inventory UI is only shown once receiving an item.
	 *
	 * Defaults to `false`.
	 */
	public alwaysEnableInventoryUI = false;

	private isUISetup = false;

	private inventoryUIPrefab: GameObject | undefined;

	private inventories = new Map<number, InventoryEntry>();

	private itemTypes: string[] = [];
	private readonly itemAccessories = new Map<string, AccessoryComponent[]>();
	private readonly internalIdToItemType = new Map<number, string>();
	private internalIdCounter = 0;

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
		// this.missingItemAccessory = AssetCache.LoadAsset<AccessoryComponent>(
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

				if (character.inventory.GetAllItems().size() > 0 || Airship.Inventory.alwaysEnableInventoryUI) {
					this.isUISetup = true;
					this.CreateUI();
					return;
				}
				character.inventory.onChanged.Connect(() => {
					if (!this.isUISetup) {
						this.isUISetup = true;
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

	private CreateUI(): void {
		let prefab: GameObject;
		if (this.inventoryUIPrefab) {
			prefab = this.inventoryUIPrefab;
		} else {
			prefab = AssetCache.LoadAsset(
				"Assets/AirshipPackages/@Easy/Core/Prefabs/Inventory/AirshipInventoryUI.prefab",
			);
		}
		const go = Object.Instantiate(prefab);
	}

	private StartClient(): void {
		CoreNetwork.ServerToClient.UpdateInventory.client.OnServerEvent((dto) => {
			let inv = this.GetInventory(dto.id);
			inv?.ProcessDto(dto);
		});
		CoreNetwork.ServerToClient.SetInventorySlot.client.OnServerEvent(
			(invId, slot, itemStackDto, clientPredicted) => {
				if (RunUtil.IsHosting()) return;
				const inv = this.GetInventory(invId);
				if (!inv) return;

				const itemStack = itemStackDto !== undefined ? ItemStack.Decode(itemStackDto) : undefined;
				inv.SetItem(slot, itemStack);
			},
		);
		CoreNetwork.ServerToClient.UpdateInventorySlot.client.OnServerEvent((invId, slot, itemType, amount) => {
			const inv = this.GetInventory(invId);
			if (!inv) return;

			const itemStack = inv.GetItem(slot);
			if (itemStack === undefined) return;

			if (itemType !== undefined) {
				itemStack.SetItemType(itemType);
			}
			if (amount !== undefined) {
				itemStack.SetAmount(amount);
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

				const fromItemStack = fromInv.GetItem(fromSlot);
				if (!fromItemStack) return;

				const toItemStack = toInv.GetItem(toSlot);
				if (toItemStack !== undefined) {
					if (toItemStack.CanMerge(fromItemStack)) {
						if (toItemStack.GetAmount() + amount <= toItemStack.GetMaxStackSize()) {
							toItemStack.SetAmount(toItemStack.GetAmount() + amount);
							fromItemStack.Decrement(amount);
							CoreNetwork.ClientToServer.Inventory.MoveToSlot.client.FireServer(
								fromInv.id,
								fromSlot,
								toInv.id,
								toSlot,
								amount,
							);
							return;
						}
						// can't merge so do nothing
						return;
					}
				}

				this.SwapSlots(fromInv, fromSlot, toInv, toSlot, {
					clientPredicted: true,
				});
			},
		);

		CoreNetwork.ClientToServer.Inventory.QuickMoveSlot.server.OnClientEvent(
			(player, fromInvId, fromSlot, toInvId) => {
				const fromInv = this.GetInventory(fromInvId);
				if (!fromInv) return;

				const toInv = this.GetInventory(toInvId);
				if (!toInv) return;

				const itemStack = fromInv.GetItem(fromSlot);
				if (!itemStack) return;

				if (fromSlot < fromInv.GetHotbarSlotCount()) {
					// move to backpack

					let completed = false;

					// find slots to merge
					for (let i = fromInv.GetHotbarSlotCount(); i < fromInv.GetMaxSlots(); i++) {
						const otherItemStack = fromInv.GetItem(i);
						if (otherItemStack?.CanMerge(itemStack)) {
							if (otherItemStack.GetAmount() < otherItemStack.GetMaxStackSize()) {
								let delta = math.min(
									itemStack.GetAmount(),
									otherItemStack.GetMaxStackSize() - otherItemStack.GetAmount(), // amount free in stack
								);
								otherItemStack.SetAmount(otherItemStack.GetAmount() + delta, {
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
						for (let i = fromInv.GetHotbarSlotCount(); i < fromInv.GetMaxSlots(); i++) {
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
					for (let i = 0; i < fromInv.GetHotbarSlotCount(); i++) {
						const otherItemStack = fromInv.GetItem(i);
						if (otherItemStack?.CanMerge(itemStack)) {
							if (otherItemStack.GetAmount() < otherItemStack.GetMaxStackSize()) {
								let delta = math.max(
									otherItemStack.GetMaxStackSize() - itemStack.GetAmount(),
									otherItemStack.GetMaxStackSize() - otherItemStack.GetAmount(),
								);
								otherItemStack.SetAmount(otherItemStack.GetAmount() + delta, {
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
						for (let i = 0; i < fromInv.GetHotbarSlotCount(); i++) {
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

	public Unsubscribe(clientId: number, inventory: Inventory): void {
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
		this.inventories.delete(inventory.id);
	}

	public QuickMoveSlot(inv: Inventory, slot: number): void {
		const itemStack = inv.GetItem(slot);
		if (!itemStack) return;

		if (slot < inv.GetHotbarSlotCount()) {
			// move to backpack

			let completed = false;

			// find slots to merge
			if (!completed) {
				for (let i = inv.GetHotbarSlotCount(); i < inv.GetMaxSlots(); i++) {
					const otherItemStack = inv.GetItem(i);
					if (otherItemStack?.CanMerge(itemStack)) {
						if (otherItemStack.GetAmount() < otherItemStack.GetMaxStackSize()) {
							let delta = math.min(
								itemStack.GetAmount(),
								otherItemStack.GetMaxStackSize() - otherItemStack.GetAmount(),
							);
							otherItemStack.SetAmount(otherItemStack.GetAmount() + delta);
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
				for (let i = inv.GetHotbarSlotCount(); i < inv.GetMaxSlots(); i++) {
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
				for (let i = 0; i < inv.GetHotbarSlotCount(); i++) {
					const otherItemStack = inv.GetItem(i);
					if (otherItemStack?.CanMerge(itemStack)) {
						if (otherItemStack.GetAmount() < otherItemStack.GetMaxStackSize()) {
							let delta = math.max(
								otherItemStack.GetMaxStackSize() - itemStack.GetAmount(),
								otherItemStack.GetMaxStackSize() - otherItemStack.GetAmount(),
							);
							otherItemStack.SetAmount(otherItemStack.GetAmount() + delta);
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
				for (let i = 0; i < inv.GetHotbarSlotCount(); i++) {
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

		if (RunUtil.IsClient()) {
			CoreNetwork.ClientToServer.Inventory.QuickMoveSlot.client.FireServer(inv.id, slot, inv.id);
		}

		// SetTimeout(0.1, () => {
		// 	this.CheckInventoryOutOfSync();
		// });
	}

	public MoveToSlot(fromInv: Inventory, fromSlot: number, toInv: Inventory, toSlot: number, amount: number): void {
		const fromItemStack = fromInv.GetItem(fromSlot);
		if (!fromItemStack) return;

		const toItemStack = toInv.GetItem(toSlot);
		if (toItemStack !== undefined) {
			if (toItemStack.CanMerge(fromItemStack)) {
				if (toItemStack.GetAmount() + amount <= toItemStack.GetMaxStackSize()) {
					toItemStack.SetAmount(toItemStack.GetAmount() + amount);
					fromItemStack.Decrement(amount);
					CoreNetwork.ClientToServer.Inventory.MoveToSlot.client.FireServer(
						fromInv.id,
						fromSlot,
						toInv.id,
						toSlot,
						amount,
					);
					return;
				}
				// can't merge so do nothing
				return;
			}
		}

		this.SwapSlots(fromInv, fromSlot, toInv, toSlot, {
			clientPredicted: true,
		});
		CoreNetwork.ClientToServer.Inventory.MoveToSlot.client.FireServer(
			fromInv.id,
			fromSlot,
			toInv.id,
			toSlot,
			amount,
		);
	}

	public SetUIEnabled(enabled: boolean): void {
		// Dependency<InventoryUIController>().SetEnabled(enabled);
	}

	public SetHealtbarVisible(visible: boolean) {
		// Dependency<InventoryUIController>().SetHealtbarVisible(visible);
	}

	public SetHotbarVisible(visible: boolean) {
		// Dependency<InventoryUIController>().SetHotbarVisible(visible);
	}

	public SetBackpackVisible(visible: boolean) {
		// Dependency<InventoryUIController>().SetBackpackVisible(visible);
	}

	public SetInventoryUIPrefab(prefab: GameObject): void {
		this.inventoryUIPrefab = prefab;
	}

	public SetLocalInventory(inventory: Inventory): void {
		this.localInventory = inventory;
		this.localInventoryChanged.Fire(inventory);
	}

	public ObserveLocalInventory(callback: (inv: Inventory) => CleanupFunc): Bin {
		const bin = new Bin();
		let cleanup: CleanupFunc;
		if (this.localInventory) {
			cleanup = callback(this.localInventory);
		}

		bin.Add(
			this.localInventoryChanged.Connect((inv) => {
				cleanup = callback(inv);
			}),
		);
		bin.Add(() => {
			cleanup?.();
		});
		return bin;
	}

	public ObserveLocalHeldItem(callback: (itemStack: ItemStack | undefined) => CleanupFunc): Bin {
		const bin = new Bin();

		let cleanup: CleanupFunc;

		const invBin = new Bin();
		bin.Add(
			this.ObserveLocalInventory((inv) => {
				invBin.Clean();
				if (inv) {
					invBin.Add(
						inv.ObserveHeldItem((itemStack) => {
							cleanup?.();
							cleanup = callback(itemStack);
						}),
					);
				} else {
					cleanup = callback(undefined);
				}
			}),
		);
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
			error("FATAL: ItemType had no ItemMeta: " + itemType);
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
}
