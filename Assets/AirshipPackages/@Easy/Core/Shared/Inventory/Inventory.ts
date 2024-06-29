import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { ArmorType } from "@Easy/Core/Shared/Item/ArmorType";
import { CoreItemType } from "@Easy/Core/Shared/Item/CoreItemType";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import Object from "@Easy/Core/Shared/Util/ObjectUtils";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import Character from "../Character/Character";
import { Game } from "../Game";
import { Keyboard, Mouse } from "../UserInput";
import { CanvasAPI } from "../Util/CanvasAPI";
import { ItemStack, ItemStackDto } from "./ItemStack";
import { BeforeLocalInventoryHeldSlotChanged } from "./Signal/BeforeLocalInventoryHeldSlotChanged";

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

	/** Used to cancel changing held item slots. */
	@NonSerialized() public readonly onBeforeLocalHeldSlotChanged = new Signal<BeforeLocalInventoryHeldSlotChanged>();
	/** Fired when a `slot` points to a new `ItemStack`. Changes to the same ItemStack will **not** fire this event. */
	@NonSerialized() public readonly onSlotChanged = new Signal<[slot: number, itemStack: ItemStack | undefined]>();
	@NonSerialized() public readonly onHeldSlotChanged = new Signal<number>();
	/**
	 * Fired whenever any change happens.
	 * This includes changes to ItemStacks.
	 **/
	@NonSerialized() public readonly onChanged = new Signal<void>();
	@NonSerialized() private finishedInitialReplication = false;
	@NonSerialized() private slotConnections = new Map<number, Bin>();

	private bin = new Bin();

	// Controls
	private controlsEnabled = true;
	private lastScrollTime = 0;
	private scrollCooldown = 0.05;
	private disablers = new Set<number>();
	private disablerCounter = 1;

	private observeHeldItemBins: Bin[] = [];

	public OnEnable(): void {
		// Networking
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

		if (Game.IsServer()) {
			CoreNetwork.ClientToServer.SetHeldSlot.server.OnClientEvent((player, invId, slot) => {
				if (this.id !== invId) return;

				const character = Airship.characters.FindByPlayer(player);
				if (!character || character.inventory !== this) return;

				this.SetHeldSlotInternal(slot);

				CoreNetwork.ServerToClient.SetHeldInventorySlot.server.FireExcept(
					player,
					this.id,
					player.clientId,
					slot,
					true,
				);
			});
		}

		// Controls
		const controlsBin = new Bin();
		this.bin.Add(controlsBin);
		this.bin.Add(
			Airship.inventory.ObserveLocalInventory((inv) => {
				controlsBin.Clean();
				if (inv !== this) return;

				print("Starting local controls!");
				const keyboard = new Keyboard();
				const mouse = new Mouse();

				const hotbarKeys = [
					Key.Digit1,
					Key.Digit2,
					Key.Digit3,
					Key.Digit4,
					Key.Digit5,
					Key.Digit6,
					Key.Digit7,
					Key.Digit8,
					Key.Digit9,
				];

				for (const hotbarIndex of $range(0, hotbarKeys.size() - 1)) {
					keyboard.OnKeyDown(hotbarKeys[hotbarIndex], (event) => {
						// if (!this.enabled || event.uiProcessed) return;
						this.SetHeldSlot(hotbarIndex);
					});
				}

				// Scroll to select held item:
				mouse.scrolled.Connect((event) => {
					if (!this.controlsEnabled || event.uiProcessed) return;
					if (CanvasAPI.IsPointerOverUI()) return;
					// print("scroll: " + delta);
					if (math.abs(event.delta) < 0.05) return;

					const now = Time.time;
					if (now - this.lastScrollTime < this.scrollCooldown) {
						return;
					}

					this.lastScrollTime = now;

					const selectedSlot = this.GetHeldSlot();
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
						const itemAtSlot = this.GetItem(trySlot);
						if (itemAtSlot !== undefined) {
							this.SetHeldSlot(trySlot);
							break;
						}
					}
				});
			}),
		);
	}

	public OnDisable(): void {
		Airship.inventory.UnregisterInventory(this);
		for (const bin of this.observeHeldItemBins) {
			bin.Clean();
		}
		this.observeHeldItemBins.clear();
		this.bin.Clean();
	}

	/**
	 * @returns True if inventory is controlled by the local player.
	 */
	public IsLocalInventory(): boolean {
		return Airship.inventory.localInventory === this;
	}

	private RequestFullUpdate(): void {
		const dto = Airship.inventory.remotes.clientToServer.getFullUpdate.client.FireServer(this.id);
		if (dto) {
			this.ProcessDto(dto);
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
		this.observeHeldItemBins.push(bin);
		let currentItemStack = this.items.get(this.heldSlot);
		let cleanup = callback(currentItemStack);

		bin.Add(
			CoreNetwork.ServerToClient.SetHeldInventorySlot.client.OnServerEvent((invId, clientId, slot) => {
				const inventoryClientId = this.gameObject.GetAirshipComponent<Character>()?.player?.clientId;
				if (invId === this.id && clientId === inventoryClientId) {
					const selected = this.items.get(slot);
					if (selected?.GetItemType() === currentItemStack?.GetItemType()) return;

					if (cleanup !== undefined) {
						cleanup();
					}
					currentItemStack = selected;
					cleanup = callback(selected);
				}
			}),
		);

		bin.Add(
			this.onHeldSlotChanged.Connect((newSlot) => {
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
			this.onSlotChanged.Connect((slot, itemStack) => {
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
					this.onChanged.Fire();
				}),
			);
			bin.Add(
				itemStack.changed.Connect(() => {
					this.onChanged.Fire();
				}),
			);
			this.slotConnections.set(slot, bin);

			if (Game.IsServer()) {
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
		this.onSlotChanged.Fire(slot, itemStack);
		this.onChanged.Fire();

		if (Game.IsServer() && this.finishedInitialReplication) {
			// todo: figure out which clients to include
			CoreNetwork.ServerToClient.SetInventorySlot.server.FireAllClients(
				this.id,
				slot,
				itemStack?.Encode(),
				config?.clientPredicted ?? false,
			);
		}
	}

	public Decrement(itemType: string, amount: number): void {
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
		let isLocal = this.IsLocalInventory();
		if (isLocal) {
			const before = this.onBeforeLocalHeldSlotChanged.Fire(
				new BeforeLocalInventoryHeldSlotChanged(slot, this.heldSlot),
			);
			if (before.IsCancelled()) return;
		}

		this.SetHeldSlotInternal(slot);

		if (isLocal) {
			CoreNetwork.ClientToServer.SetHeldSlot.client.FireServer(this.id, slot);
		}
	}

	private SetHeldSlotInternal(slot: number): void {
		this.heldSlot = slot;
		this.onHeldSlotChanged.Fire(slot);
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
		this.id = dto.id;
		for (let pair of dto.items) {
			this.SetItem(pair[0], ItemStack.Decode(pair[1]));
		}
		this.SetHeldSlot(dto.heldSlot);
	}

	public HasEnough(itemType: CoreItemType, amount: number): boolean {
		let total = 0;
		for (let itemStack of Object.values(this.items)) {
			if (itemStack.GetItemType() === itemType) {
				total += itemStack.GetAmount();
			}
		}
		return total >= amount;
	}

	public HasItemType(itemType: CoreItemType): boolean {
		return this.HasEnough(itemType, 1);
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

	public FindSlotWithItemType(itemType: CoreItemType): number | undefined {
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

	public AddControlsDisabler(): () => void {
		const id = this.disablerCounter;
		this.disablerCounter++;
		this.disablers.add(id);
		this.controlsEnabled = false;
		return () => {
			this.disablers.delete(id);
			if (this.disablers.size() === 0) {
				this.controlsEnabled = true;
			} else {
				this.controlsEnabled = false;
			}
		};
	}
}
