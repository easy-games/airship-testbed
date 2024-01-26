import { Controller, OnStart, Service } from "@easy-games/flamework-core";
import { Airship } from "Shared/Airship";
import Character from "Shared/Character/Character";
import { CoreNetwork } from "Shared/CoreNetwork";
import { RunUtil } from "Shared/Util/RunUtil";
import { CharacterInventorySingleton } from "./CharacterInventorySingleton";
import Inventory from "./Inventory";
import { ItemStack } from "./ItemStack";

interface InventoryEntry {
	Inv: Inventory;
	Viewers: Set<number>;
	Owners: Set<number>;
}

@Controller({})
@Service({})
export class InventorySingleton implements OnStart {
	private inventories = new Map<number, InventoryEntry>();

	constructor(public readonly localCharacterInventory: CharacterInventorySingleton) {
		Airship.inventory = this;
	}

	OnStart(): void {
		if (RunUtil.IsClient()) {
			this.StartClient();
		}
		if (RunUtil.IsServer()) {
			this.StartServer();
		}
	}

	private StartClient(): void {
		CoreNetwork.ServerToClient.UpdateInventory.client.OnServerEvent((dto) => {
			let inv = this.GetInventory(dto.id);
			inv?.ProcessDto(dto);
		});
		CoreNetwork.ServerToClient.SetInventorySlot.client.OnServerEvent(
			(invId, slot, itemStackDto, clientPredicted) => {
				const inv = this.GetInventory(invId);
				if (!inv) return;

				// if (this.localInventory === inv && clientPredicted) return;

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
		CoreNetwork.ServerToClient.SetHeldInventorySlot.client.OnServerEvent((invId, slot, clientPredicted) => {
			const inv = this.GetInventory(invId);
			if (!inv) return;

			// if (this.localInventory === inv && clientPredicted) return;

			inv.SetHeldSlot(slot);
		});
	}

	private StartServer(): void {
		CoreNetwork.ClientToServer.SetHeldSlot.server.OnClientEvent((clientId, slot) => {
			const character = Airship.characters.FindByClientId(clientId);
			if (!character) return;

			const inv = character.gameObject.GetAirshipComponent<Inventory>();
			inv?.SetHeldSlot(slot);

			CoreNetwork.ServerToClient.SetHeldInventorySlot.server.FireAllClients(character.id, slot, true);
		});

		CoreNetwork.ClientToServer.Inventory.SwapSlots.server.OnClientEvent(
			(clientId, frommInvId, fromSlot, toInvId, toSlot) => {},
		);

		CoreNetwork.ClientToServer.Inventory.MoveToSlot.server.OnClientEvent(
			(clientId, fromInvId, fromSlot, toInvId, toSlot, amount) => {
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
			(clientId, fromInvId, fromSlot, toInvId) => {
				const fromInv = this.GetInventory(fromInvId);
				if (!fromInv) return;

				const toInv = this.GetInventory(toInvId);
				if (!toInv) return;

				const itemStack = fromInv.GetItem(fromSlot);
				if (!itemStack) return;

				if (fromSlot < fromInv.GetHotbarSlotCount()) {
					// move to backpack

					let completed = false;

					// armor
					const itemMeta = itemStack.GetMeta();
					if (!completed) {
						if (itemMeta.armor) {
							const armorSlot = fromInv.armorSlots[itemMeta.armor.armorType];
							const existingArmor = fromInv.GetItem(armorSlot);
							if (existingArmor === undefined) {
								this.SwapSlots(fromInv, fromSlot, toInv, armorSlot, {
									clientPredicted: true,
								});
								completed = true;
							}
						}
					}

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

					if (!completed) {
						if (itemMeta.armor) {
							const armorSlot = fromInv.armorSlots[itemMeta.armor.armorType];
							const existingArmor = fromInv.GetItem(armorSlot);
							if (existingArmor === undefined) {
								this.SwapSlots(fromInv, fromSlot, toInv, armorSlot, {
									clientPredicted: true,
								});
								completed = true;
							}
						}
					}

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

		// CoreNetwork.ClientToServer.Inventory.CheckOutOfSync.server.OnClientEvent((clientId, invDto) => {
		// 	const character = Airship.characters.FindByClientId(clientId);
		// 	if (!character) {
		// 		error("Character not found.");
		// 	}

		// 	const serverInvDto = character.GetInventory().Encode();

		// 	//print("----- INV SYNC CHECK -----");
		// 	if (serverInvDto.items.size() !== invDto.items.size()) {
		// 		// print(
		// 		// 	"Inventory sizes don't match. Client: " +
		// 		// 		invDto.items.size() +
		// 		// 		", Server: " +
		// 		// 		serverInvDto.items.size(),
		// 		// );
		// 	}

		// 	for (let slot = 0; slot < 45; slot++) {
		// 		const serverItem = serverInvDto.items.get(slot);
		// 		const clientItem = invDto.items.get(slot);
		// 		if (inspect(serverItem) !== inspect(clientItem)) {
		// 			// print(
		// 			// 	`Slot ${slot} mismatch. Server: ${serverItem?.i},${serverItem?.a}  Client: ${clientItem?.i},${clientItem?.a}`,
		// 			// );
		// 		}
		// 	}
		// 	//print("----- END -----");
		// });
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

	public GetInvEntry(inventory: Inventory): InventoryEntry {
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
		if (RunUtil.IsClient() && character?.IsLocalCharacter()) {
			print("local inv");
			this.localCharacterInventory.SetLocalInventory(inventory);
		}
		print("Registered inventory " + inventory.id);
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

			// armor
			const itemMeta = itemStack.GetMeta();
			if (!completed) {
				if (itemMeta.armor) {
					const armorSlot = inv.armorSlots[itemMeta.armor.armorType];
					const existingArmor = inv.GetItem(armorSlot);
					if (existingArmor === undefined) {
						this.SwapSlots(inv, slot, inv, armorSlot, {
							clientPredicted: RunUtil.IsClient(),
						});
						completed = true;
					}
				}
			}

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

			// armor
			if (!completed) {
				if (itemMeta.armor) {
					const armorSlot = inv.armorSlots[itemMeta.armor.armorType];
					const existingArmor = inv.GetItem(armorSlot);
					if (existingArmor === undefined) {
						this.SwapSlots(inv, slot, inv, armorSlot, {
							clientPredicted: RunUtil.IsClient(),
						});
						completed = true;
					}
				}
			}

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
}
