import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Inventory } from "Shared/Inventory/Inventory";
import { EntityService } from "../Entity/EntityService";

interface InventoryEntry {
	Inv: Inventory;
	Viewers: Set<number>;
	Owners: Set<number>;
}

@Service({})
export class InventoryService implements OnStart {
	private inventories = new Map<number, InventoryEntry>();
	private invIdCounter = 1;

	OnStart(): void {
		CoreNetwork.ClientToServer.SetHeldSlot.Server.OnClientEvent((clientId, slot) => {
			const entity = Dependency<EntityService>().GetEntityByClientId(clientId);
			if (!entity) return;
			if (!(entity instanceof CharacterEntity)) {
				return;
			}

			entity.GetInventory().SetHeldSlot(slot);

			CoreNetwork.ServerToClient.SetHeldInventorySlot.Server.FireAllClients(entity.id, slot, true);
		});

		CoreNetwork.ClientToServer.Inventory.SwapSlots.Server.OnClientEvent(
			(clientId, frommInvId, fromSlot, toInvId, toSlot) => {},
		);

		CoreNetwork.ClientToServer.Inventory.QuickMoveSlot.Server.OnClientEvent(
			(clientId, fromInvId, fromSlot, toInvId) => {
				const fromInv = this.GetInventoryFromId(fromInvId);
				if (!fromInv) return;

				const toInv = this.GetInventoryFromId(toInvId);
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

		CoreNetwork.ClientToServer.Inventory.CheckOutOfSync.Server.OnClientEvent((clientId, invDto) => {
			const entity = Dependency<EntityService>().GetEntityByClientId(clientId) as CharacterEntity | undefined;
			if (!entity) {
				error("Entity not found.");
			}

			const serverInvDto = entity.GetInventory().Encode();

			//print("----- INV SYNC CHECK -----");
			if (serverInvDto.items.size() !== invDto.items.size()) {
				// print(
				// 	"Inventory sizes don't match. Client: " +
				// 		invDto.items.size() +
				// 		", Server: " +
				// 		serverInvDto.items.size(),
				// );
			}

			for (let slot = 0; slot < 45; slot++) {
				const serverItem = serverInvDto.items.get(slot);
				const clientItem = invDto.items.get(slot);
				if (inspect(serverItem) !== inspect(clientItem)) {
					// print(
					// 	`Slot ${slot} mismatch. Server: ${serverItem?.i},${serverItem?.a}  Client: ${clientItem?.i},${clientItem?.a}`,
					// );
				}
			}
			//print("----- END -----");
		});
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
		const found = this.inventories.get(inventory.Id);
		if (found) {
			return found;
		}
		const entry: InventoryEntry = {
			Inv: inventory,
			Viewers: new Set(),
			Owners: new Set(),
		};
		this.inventories.set(inventory.Id, entry);
		return entry;
	}

	public GetInventoryFromId(id: number): Inventory | undefined {
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

	public MakeInventory(): Inventory {
		const inv = new Inventory(this.invIdCounter);
		this.invIdCounter++;
		return inv;
	}
}
