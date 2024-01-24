import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Game } from "Shared/Game";
import { Inventory } from "Shared/Inventory/Inventory";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { Keyboard, Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { Signal } from "Shared/Util/Signal";

@Controller({})
export class InventoryController implements OnStart {
	private inventories = new Map<number, Inventory>();
	public localInventory?: Inventory;

	public heldSlotChanged = new Signal<number>();
	public localInventoryAdded = new Signal<Inventory>();

	private enabled = true;
	private disablers = new Set<number>();
	private disablerCounter = 1;

	private lastScrollTime = 0;
	private scrollCooldown = 0.05;

	constructor() {}

	OnStart(): void {
		CoreNetwork.ServerToClient.UpdateInventory.client.OnServerEvent((dto) => {
			let inv = this.GetInventory(dto.id);
			if (!inv) {
				inv = new Inventory(dto.id);
				this.inventories.set(dto.id, inv);
			}
			inv.ProcessDto(dto);
		});
		CoreNetwork.ServerToClient.SetInventorySlot.client.OnServerEvent(
			(invId, slot, itemStackDto, clientPredicted) => {
				const inv = this.GetInventory(invId);
				if (!inv) return;

				if (this.localInventory === inv && clientPredicted) return;

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

			if (this.localInventory === inv && clientPredicted) return;

			inv.SetHeldSlot(slot);
		});
		// todo: inventory
		// Airship.characters.onCharacterSpawned.ConnectWithPriority(SignalPriority.HIGHEST, (character) => {
		// 	this.inventories.set(character.GetInventory().id, character.GetInventory());
		// 	if (character.IsLocalCharacter()) {
		// 		this.SetLocalInventory(character.GetInventory());
		// 	}
		// });

		const keyboard = new Keyboard();
		const mouse = new Mouse();

		const hotbarKeys = [
			KeyCode.Alpha1,
			KeyCode.Alpha2,
			KeyCode.Alpha3,
			KeyCode.Alpha4,
			KeyCode.Alpha5,
			KeyCode.Alpha6,
			KeyCode.Alpha7,
			KeyCode.Alpha8,
			KeyCode.Alpha9,
		];

		for (const hotbarIndex of $range(0, hotbarKeys.size() - 1)) {
			keyboard.OnKeyDown(hotbarKeys[hotbarIndex], (event) => {
				if (!this.enabled || event.uiProcessed) return;
				this.SetHeldSlot(hotbarIndex);
			});
		}

		keyboard.OnKeyDown(KeyCode.Q, (event) => {
			if (!this.enabled || event.uiProcessed) return;
			this.DropItemInHand();
		});

		// Scroll to select held item:
		mouse.scrolled.Connect((event) => {
			if (!this.enabled || event.uiProcessed) return;
			// print("scroll: " + delta);
			if (math.abs(event.delta) < 0.05) return;

			const now = Time.time;
			if (now - this.lastScrollTime < this.scrollCooldown) {
				return;
			}

			this.lastScrollTime = now;

			const selectedSlot = this.localInventory?.GetHeldSlot();
			if (selectedSlot === undefined) return;

			const inc = event.delta < 0 ? 1 : -1;
			let trySlot = selectedSlot;

			// Find the next available item in the hotbar:
			for (const _ of $range(1, hotbarKeys.size())) {
				trySlot += inc;

				// Clamp index to hotbar items:
				if (inc === 1 && trySlot >= hotbarKeys.size()) {
					trySlot = 0;
				} else if (inc === -1 && trySlot < 0) {
					trySlot = hotbarKeys.size() - 1;
				}

				// If the item at the given `trySlot` index exists, set it as the held item:
				const itemAtSlot = this.localInventory?.GetItem(trySlot);
				if (itemAtSlot !== undefined) {
					this.SetHeldSlot(trySlot);
					break;
				}
			}
		});
	}

	public AddDisabler(): () => void {
		const id = this.disablerCounter;
		this.disablerCounter++;
		this.disablers.add(id);
		this.enabled = false;
		return () => {
			this.disablers.delete(id);
			if (this.disablers.size() === 0) {
				this.enabled = true;
			} else {
				this.enabled = false;
			}
		};
	}

	public SwapSlots(
		fromInventory: Inventory,
		fromSlot: number,
		toInventory: Inventory,
		toSlot: number,
		config?: {
			noNetwork: boolean;
		},
	): void {
		const fromItem = fromInventory.GetItem(fromSlot);
		const toItem = toInventory.GetItem(toSlot);

		toInventory.SetItem(toSlot, fromItem, {
			clientPredicted: config?.noNetwork,
		});
		fromInventory.SetItem(fromSlot, toItem, {
			clientPredicted: config?.noNetwork,
		});
	}

	public CheckInventoryOutOfSync(): void {
		if (!this.localInventory) {
			error("missing local inventory.");
		}

		CoreNetwork.ClientToServer.Inventory.CheckOutOfSync.client.FireServer(this.localInventory.Encode());
	}

	public DropItemInHand(): void {
		const heldItem = this.localInventory?.GetHeldItem();
		if (heldItem) {
			CoreNetwork.ClientToServer.DropItemInSlot.client.FireServer(this.localInventory!.GetHeldSlot(), 1);
		}
	}

	public DropItemInSlot(slot: number, amount: number): void {
		CoreNetwork.ClientToServer.DropItemInSlot.client.FireServer(slot, amount);
	}

	public SetLocalInventory(inventory: Inventory): void {
		this.localInventory = inventory;
		this.localInventoryAdded.Fire(inventory);
	}

	public ObserveLocalInventory(callback: (inv: Inventory) => CleanupFunc): Bin {
		const bin = new Bin();
		let cleanup: CleanupFunc;
		if (Game.localPlayer.character) {
			// todo: inventory
			// cleanup = callback(Game.localPlayer.character.GetInventory());
		}

		bin.Add(
			Game.localPlayer.ObserveCharacter((character) => {
				cleanup?.();
				if (character) {
					// todo: inventory
					// cleanup = callback(entity.GetInventory());
				}
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

	public SetHeldSlot(slot: number): void {
		if (Game.localPlayer.character === undefined) return;
		if (this.localInventory === undefined) return;

		this.localInventory.SetHeldSlot(slot);
		this.heldSlotChanged.Fire(slot);
		CoreNetwork.ClientToServer.SetHeldSlot.client.FireServer(slot);
	}

	public GetInventory(id: number): Inventory | undefined {
		return this.inventories.get(id);
	}

	public RegisterInventory(inv: Inventory): void {
		this.inventories.set(inv.id, inv);
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
			noNetwork: true,
		});
		CoreNetwork.ClientToServer.Inventory.MoveToSlot.client.FireServer(
			fromInv.id,
			fromSlot,
			toInv.id,
			toSlot,
			amount,
		);
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
							noNetwork: true,
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
							noNetwork: true,
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
							noNetwork: true,
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
							noNetwork: true,
						});
						completed = true;
						break;
					}
				}
			}
		}

		CoreNetwork.ClientToServer.Inventory.QuickMoveSlot.client.FireServer(inv.id, slot, inv.id);

		// SetTimeout(0.1, () => {
		// 	this.CheckInventoryOutOfSync();
		// });
	}
}
