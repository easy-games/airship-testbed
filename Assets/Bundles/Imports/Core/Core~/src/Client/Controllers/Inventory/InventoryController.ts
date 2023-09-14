import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Game } from "Shared/Game";
import { Inventory } from "Shared/Inventory/Inventory";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { Keyboard, Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { Signal, SignalPriority } from "Shared/Util/Signal";

@Controller({})
export class InventoryController implements OnStart {
	private inventories = new Map<number, Inventory>();
	public LocalInventory?: Inventory;

	public HeldSlotChanged = new Signal<number>();
	public LocalInventoryAdded = new Signal<Inventory>();

	private enabled = true;
	private disablers = new Set<number>();
	private disablerCounter = 1;

	private lastScrollTime = 0;
	private scrollCooldown = 0.1;

	constructor() {}

	OnStart(): void {
		CoreNetwork.ServerToClient.UpdateInventory.Client.OnServerEvent((dto) => {
			let inv = this.GetInventory(dto.id);
			if (!inv) {
				inv = new Inventory(dto.id);
				this.inventories.set(dto.id, inv);
			}
			inv.ProcessDto(dto);
		});
		CoreNetwork.ServerToClient.SetInventorySlot.Client.OnServerEvent(
			(invId, slot, itemStackDto, clientPredicted) => {
				const inv = this.GetInventory(invId);
				if (!inv) return;

				if (this.LocalInventory === inv && clientPredicted) return;

				const itemStack = itemStackDto !== undefined ? ItemStack.Decode(itemStackDto) : undefined;
				inv.SetItem(slot, itemStack);
			},
		);
		CoreNetwork.ServerToClient.UpdateInventorySlot.Client.OnServerEvent((invId, slot, itemType, amount) => {
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
		CoreNetwork.ServerToClient.SetHeldInventorySlot.Client.OnServerEvent((invId, slot, clientPredicted) => {
			const inv = this.GetInventory(invId);
			if (!inv) return;

			if (this.LocalInventory === inv && clientPredicted) return;

			inv.SetHeldSlot(slot);
		});
		CoreClientSignals.EntitySpawn.ConnectWithPriority(SignalPriority.HIGHEST, (event) => {
			if (event.entity instanceof CharacterEntity) {
				this.inventories.set(event.entity.GetInventory().Id, event.entity.GetInventory());
				if (event.entity.IsLocalCharacter()) {
					this.SetLocalInventory((event.entity as CharacterEntity).GetInventory());
				}
			}
		});

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
				if (!this.enabled) return;
				this.SetHeldSlot(hotbarIndex);
			});
		}

		keyboard.OnKeyDown(KeyCode.Q, (event) => {
			if (!this.enabled) return;
			this.DropItemInHand();
		});

		// Scroll to select held item:
		mouse.Scrolled.Connect((delta) => {
			if (!this.enabled) return;
			if (math.abs(delta) > 0.1) return;

			const now = Time.time;
			if (now - this.lastScrollTime < this.scrollCooldown) {
				return;
			}
			if (CanvasAPI.IsPointerOverUI()) return;

			this.lastScrollTime = now;

			const selectedSlot = this.LocalInventory?.GetSelectedSlot();
			if (selectedSlot === undefined) return;

			const inc = delta < 0 ? 1 : -1;
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
				const itemAtSlot = this.LocalInventory?.GetItem(trySlot);
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
		if (!this.LocalInventory) {
			error("missing local inventory.");
		}

		CoreNetwork.ClientToServer.Inventory.CheckOutOfSync.Client.FireServer(this.LocalInventory.Encode());
	}

	public DropItemInHand(): void {
		const heldItem = this.LocalInventory?.GetHeldItem();
		if (heldItem) {
			CoreNetwork.ClientToServer.DropItemInHand.Client.FireServer(1);
		}
	}

	public SetLocalInventory(inventory: Inventory): void {
		this.LocalInventory = inventory;
		this.LocalInventoryAdded.Fire(inventory);
	}

	public ObserveLocalInventory(callback: (inv: Inventory) => CleanupFunc): Bin {
		const bin = new Bin();
		let cleanup: CleanupFunc;
		if (Game.LocalPlayer.Character && Game.LocalPlayer.Character instanceof CharacterEntity) {
			cleanup = callback(Game.LocalPlayer.Character.GetInventory());
		}

		bin.Add(
			Game.LocalPlayer.ObserveCharacter((entity) => {
				cleanup?.();
				if (entity && entity instanceof CharacterEntity) {
					cleanup = callback(entity.GetInventory());
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
		if (this.LocalInventory === undefined) return;

		this.LocalInventory.SetHeldSlot(slot);
		this.HeldSlotChanged.Fire(slot);
		CoreNetwork.ClientToServer.SetHeldSlot.Client.FireServer(slot);
	}

	public GetInventory(id: number): Inventory | undefined {
		return this.inventories.get(id);
	}

	public RegisterInventory(inv: Inventory): void {
		this.inventories.set(inv.Id, inv);
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

		CoreNetwork.ClientToServer.Inventory.QuickMoveSlot.Client.FireServer(inv.Id, slot, inv.Id);

		// SetTimeout(0.1, () => {
		// 	this.CheckInventoryOutOfSync();
		// });
	}
}
