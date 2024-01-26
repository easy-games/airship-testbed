import inspect from "@easy-games/unity-inspect";
import Object from "@easy-games/unity-object-utils";
import { Airship } from "Shared/Airship";
import { CoreNetwork } from "Shared/CoreNetwork";
import { ArmorType } from "Shared/Item/ArmorType";
import { ItemType } from "Shared/Item/ItemType";
import { Bin } from "Shared/Util/Bin";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal } from "Shared/Util/Signal";
import { ItemStack, ItemStackDto } from "./ItemStack";

export interface InventoryDto {
	id: number;
	items: Map<number, ItemStackDto>;
	heldSlot: number;
}

export default class Inventory extends AirshipBehaviour {
	public networkObject!: NetworkObject;
	@NonSerialized() public id!: number;
	public maxSlots = 48;
	public hotbarSlots = 9;
	public heldSlot = 0;
	@NonSerialized() public armorSlots: {
		[key in ArmorType]: number;
	} = {
		[ArmorType.HELMET]: 45,
		[ArmorType.CHESTPLATE]: 46,
		[ArmorType.BOOTS]: 47,
	};

	@NonSerialized() private items = new Map<number, ItemStack>();

	/** Fired when a `slot` points to a new `ItemStack`. Changes to the same ItemStack will **not** fire this event. */
	@NonSerialized() public readonly slotChanged = new Signal<[slot: number, itemStack: ItemStack | undefined]>();
	@NonSerialized() public readonly heldSlotChanged = new Signal<number>();
	/**
	 * Fired whenever any change happens.
	 * This includes changes to ItemStacks.
	 **/
	@NonSerialized() public readonly changed = new Signal<void>();
	@NonSerialized() private finishedInitialReplication = false;
	@NonSerialized() private slotConnections = new Map<number, Bin>();

	public Awake(): void {
		print("Inventory.Awake");
		if (this.networkObject.IsSpawned) {
			this.id = this.networkObject.ObjectId;
			Airship.inventory.RegisterInventory(this);
			if (RunUtil.IsClient()) {
				task.spawn(() => {
					this.RequestFullUpdate();
				});
			}
		} else {
			const conn = this.networkObject.OnStartNetwork(() => {
				print("onStartNetwork");
				Bridge.DisconnectEvent(conn);
				this.id = this.networkObject.ObjectId;
				Airship.inventory.RegisterInventory(this);
				if (RunUtil.IsClient()) {
					task.spawn(() => {
						this.RequestFullUpdate();
					});
				}
			});
		}
	}

	private RequestFullUpdate(): void {
		const dto = Airship.inventory.remotes.clientToServer.getFullUpdate.client.FireServer(this.id);
		if (dto) {
			print("inv dto: " + inspect(dto));
			// this.ProcessDto(dto);
		}
	}

	public GetItem(slot: number): ItemStack | undefined {
		return this.items.get(slot);
	}

	public GetSlot(itemStack: ItemStack): number | undefined {
		for (let pair of this.items) {
			if (pair[1] === itemStack) {
				return pair[0];
			}
		}
		return undefined;
	}

	public ObserveHeldItem(callback: (itemStack: ItemStack | undefined) => CleanupFunc): Bin {
		const bin = new Bin();
		let currentItemStack = this.items.get(this.heldSlot);
		let cleanup = callback(currentItemStack);
		bin.Add(
			this.heldSlotChanged.Connect((newSlot) => {
				const selected = this.items.get(newSlot);
				if (selected?.GetItemType() === currentItemStack?.GetItemType()) return;

				if (cleanup !== undefined) {
					cleanup();
				}
				currentItemStack = selected;
				cleanup = callback(selected);
			}),
		);
		bin.Add(
			this.slotChanged.Connect((slot, itemStack) => {
				if (slot === this.heldSlot) {
					if (itemStack?.GetItemType() === currentItemStack?.GetItemType()) return;
					if (cleanup !== undefined) {
						cleanup();
					}
					currentItemStack = itemStack;
					cleanup = callback(itemStack);
				}
			}),
		);
		bin.Add(() => {
			cleanup?.();
		});
		return bin;
	}

	public SetItem(
		slot: number,
		itemStack: ItemStack | undefined,
		config?: {
			clientPredicted?: boolean;
		},
	): void {
		this.slotConnections.get(slot)?.Clean();
		this.slotConnections.delete(slot);

		if (itemStack) {
			this.items.set(slot, itemStack);
		} else {
			this.items.delete(slot);
		}

		if (itemStack) {
			const bin = new Bin();
			bin.Add(
				itemStack.destroyed.Connect(() => {
					this.SetItem(slot, undefined);
					this.changed.Fire();
				}),
			);
			bin.Add(
				itemStack.changed.Connect(() => {
					this.changed.Fire();
				}),
			);
			this.slotConnections.set(slot, bin);

			if (RunUtil.IsServer()) {
				bin.Add(
					itemStack.amountChanged.Connect((e) => {
						if (e.NoNetwork) return;
						CoreNetwork.ServerToClient.UpdateInventorySlot.server.FireAllClients(
							this.id,
							slot,
							undefined,
							e.Amount,
						);
					}),
				);
				bin.Add(
					itemStack.itemTypeChanged.Connect((e) => {
						if (e.NoNetwork) return;
						CoreNetwork.ServerToClient.UpdateInventorySlot.server.FireAllClients(
							this.id,
							slot,
							e.ItemType,
							undefined,
						);
					}),
				);
			}
		}
		this.slotChanged.Fire(slot, itemStack);
		this.changed.Fire();

		if (RunUtil.IsServer() && this.finishedInitialReplication) {
			// todo: figure out which clients to include
			CoreNetwork.ServerToClient.SetInventorySlot.server.FireAllClients(
				this.id,
				slot,
				itemStack?.Encode(),
				config?.clientPredicted ?? false,
			);
		}
	}

	public Decrement(itemType: ItemType, amount: number): void {
		let counter = 0;
		for (let [slot, itemStack] of this.items) {
			if (itemStack.GetItemType() === itemType) {
				let remaining = amount - counter;
				if (itemStack.GetAmount() > remaining) {
					itemStack.SetAmount(itemStack.GetAmount() - remaining);
					break;
				} else {
					counter += itemStack.GetAmount();
					itemStack.Destroy();
				}
			}
		}
	}

	public StartNetworkingDiffs(): void {
		this.finishedInitialReplication = true;
	}

	public AddItem(itemStack: ItemStack): boolean {
		// Merge with existing
		for (let [otherId, otherItem] of this.items) {
			if (itemStack.CanMerge(otherItem)) {
				otherItem.SetAmount(otherItem.GetAmount() + itemStack.GetAmount());
				itemStack.Destroy();
				return true;
			}
		}

		const openSlot = this.GetFirstOpenSlot();
		if (openSlot === -1) {
			return false;
		}

		this.SetItem(openSlot, itemStack);
		return true;
	}

	/**
	 * @returns Returns the index of first empty slot. Returns -1 if no open slot found.
	 */
	public GetFirstOpenSlot(): number {
		for (let i = 0; i < this.maxSlots; i++) {
			if (!this.items.has(i)) {
				return i;
			}
		}
		return -1;
	}

	public GetHeldItem(): ItemStack | undefined {
		return this.GetItem(this.heldSlot);
	}

	public GetHeldSlot(): number {
		return this.heldSlot;
	}

	public SetHeldSlot(slot: number): void {
		this.heldSlot = slot;
		this.heldSlotChanged.Fire(slot);
		const itemStack = this.GetHeldItem();
	}

	public Encode(): InventoryDto {
		let mappedItems = new Map<number, ItemStackDto>();
		for (let item of this.items) {
			mappedItems.set(item[0], item[1].Encode());
		}
		return {
			id: this.id,
			items: mappedItems,
			heldSlot: this.heldSlot,
		};
	}

	public ProcessDto(dto: InventoryDto): void {
		for (let pair of dto.items) {
			this.SetItem(pair[0], ItemStack.Decode(pair[1]));
		}
		this.SetHeldSlot(dto.heldSlot);
	}

	public HasEnough(itemType: ItemType, amount: number): boolean {
		let total = 0;
		for (let itemStack of Object.values(this.items)) {
			if (itemStack.GetItemType() === itemType) {
				total += itemStack.GetAmount();
			}
		}
		return total >= amount;
	}

	public HasItemType(itemType: ItemType): boolean {
		return this.HasEnough(itemType, 1);
	}

	GetPairs(): Array<[slot: number, itemStack: ItemStack]> {
		return Object.entries(this.items);
	}

	public GetMaxSlots(): number {
		return this.maxSlots;
	}

	public GetBackpackTileCount(): number {
		return this.maxSlots - 9;
	}

	public GetHotbarSlotCount(): number {
		return this.hotbarSlots;
	}

	public FindSlotWithItemType(itemType: ItemType): number | undefined {
		for (let i = 0; i < this.maxSlots; i++) {
			const itemStack = this.GetItem(i);
			if (itemStack?.GetItemType() === itemType) {
				return i;
			}
		}
		return undefined;
	}

	public GetAllItems(): ItemStack[] {
		return Object.values(this.items);
	}
}
