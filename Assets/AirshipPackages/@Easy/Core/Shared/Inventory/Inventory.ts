import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import Object from "@Easy/Core/Shared/Util/ObjectUtils";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { Game } from "../Game";
import { Keyboard, Mouse } from "../UserInput";
import { Cancellable } from "../Util/Cancellable";
import { DraggingState } from "./AirshipDraggingState";
import { ItemStack, ItemStackDto } from "./ItemStack";
import { BeforeLocalInventoryHeldSlotChanged } from "./Signal/BeforeLocalInventoryHeldSlotChanged";
import { MapUtil } from "../Util/MapUtil";
import { Player } from "../Player/Player";

export interface InventoryDto {
	id: number;
	items: Map<number, ItemStackDto>;
	heldSlot: number;
}

export const enum InventoryModifyPermission {
	NetworkOwner,
	Everyone,
}

class OnBeforeAddItemEvent extends Cancellable {
	constructor(public itemStack: ItemStack) {
		super();
	}
}

export default class Inventory extends AirshipBehaviour {
	@Header("Networking")
	public networkIdentity!: NetworkIdentity;
	@NonSerialized() public id!: number;

	@Header("Slots")
	public maxSlots = 45;
	public hotbarSlots = 9;
	public heldSlot = 0;

	@Header("Permissions")
	@Tooltip("Who can modify this inventory")
	@SerializeField()
	protected modifyPermission = InventoryModifyPermission.NetworkOwner;

	@NonSerialized() private items = new Map<number, ItemStack>();

	/** Fired at the start of AddItem. Can be used to modify the added ItemStack or cancel the operation. */
	@NonSerialized() public readonly onBeforeAddItem = new Signal<OnBeforeAddItemEvent>();
	/** Used to cancel changing held item slots. */
	@NonSerialized() public readonly onBeforeLocalHeldSlotChanged = new Signal<BeforeLocalInventoryHeldSlotChanged>();
	/** Fired when a `slot` points to a new `ItemStack`. Changes to the same ItemStack will **not** fire this event. */
	@NonSerialized() public readonly onSlotChanged = new Signal<[slot: number, itemStack: ItemStack | undefined]>();
	@NonSerialized() public readonly onHeldSlotChanged = new Signal<number>();
	/**
	 * Fired when the local player drags an item outside of their inventory.
	 * This is often used to drop an item.
	 *
	 * This is only fired on the client
	 **/
	@NonSerialized() public readonly onDraggedOutsideInventory = new Signal<[drag: DraggingState]>();
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

	public GetModifyPermission(): InventoryModifyPermission {
		return this.modifyPermission;
	}

	public CanPlayerModifyInventory(player: Player): boolean {
		const target = this.modifyPermission;
		if (target === InventoryModifyPermission.NetworkOwner) {
			return Game.IsClient()
				? player === Game.localPlayer && this.networkIdentity.isOwned
				: this.networkIdentity.connectionToClient?.connectionId === player.connectionId;
		} else {
			return true;
		}
	}

	public OnEnable(): void {
		// Networking
		// if (this.networkIdentity.IsSpawned) {
		// 	this.id = this.networkIdentity.ObjectId;
		// 	Airship.Inventory.RegisterInventory(this);
		// 	if (Game.IsClient()) {
		// 		task.spawn(() => {
		// 			this.RequestFullUpdate();
		// 		});
		// 	}
		// } else {
		// 	const conn = this.networkIdentity.OnStartNetwork(() => {
		// 		Bridge.DisconnectEvent(conn);
		// 		this.id = this.networkIdentity.ObjectId;
		// 		Airship.Inventory.RegisterInventory(this);
		// 		if (Game.IsClient()) {
		// 			task.spawn(() => {
		// 				this.RequestFullUpdate();
		// 			});
		// 		}
		// 	});
		// }

		const StartClient = () => {
			// print("NetID (OnStartClient): " + this.networkIdentity.netId);
			this.id = this.networkIdentity.netId;
			task.spawn(() => {
				this.RequestFullUpdate();
			});
			if (!Game.IsServer()) {
				Airship.Inventory.RegisterInventory(this);
			}

			// This seems like it should not be here! Why are we listening to network and calling SetHeldSlotInternal()?!
			this.bin.Add(
				CoreNetwork.ServerToClient.SetHeldInventorySlot.client.OnServerEvent((invId, slot) => {
					if (invId === this.id) {
						// print("SetHeldInventorySlot invId: " + invId + ", slot: " + slot);
						// const selected = this.items.get(slot);
						// if (selected?.itemType === currentItemStack?.itemType) return;

						// if (cleanup !== undefined) {
						// 	cleanup();
						// }
						// currentItemStack = selected;
						this.SetHeldSlotInternal(slot);
						// cleanup = callback(selected);
					}
				}),
			);
		};

		const StartServer = () => {
			// print("NetID (OnStartServer): " + this.networkIdentity.netId);
			this.id = this.networkIdentity.netId;
			this.bin.Add(
				CoreNetwork.ClientToServer.SetHeldSlot.server.OnClientEvent((player, invId, slot) => {
					if (this.id !== invId) return;

					const character = Airship.Characters.FindByPlayer(player);
					if (!character || character.inventory !== this) return;

					if (!(Game.IsHosting() && Game.localPlayer === player)) {
						this.SetHeldSlotInternal(slot);
					}

					CoreNetwork.ServerToClient.SetHeldInventorySlot.server.FireExcept(player, this.id, slot, true);
				}),
			);
			Airship.Inventory.RegisterInventory(this);
		};

		if (this.networkIdentity.netId === 0) {
			this.bin.Add(
				this.networkIdentity.onStartClient.Connect(() => {
					StartClient();
				}),
			);
			this.bin.Add(
				this.networkIdentity.onStartServer.Connect(() => {
					StartServer();
				}),
			);
		} else {
			if (Game.IsServer()) {
				StartServer();
			}
			if (Game.IsClient()) {
				StartClient();
			}
		}

		// Controls
		const controlsBin = new Bin();
		this.bin.Add(controlsBin);
		this.bin.Add(
			Airship.Inventory.ObserveLocalInventory((inv) => {
				controlsBin.Clean();
				if (inv !== this) return;

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
					controlsBin.Add(
						Keyboard.OnKeyDown(hotbarKeys[hotbarIndex], (event) => {
							if (event.uiProcessed) return;
							this.SetHeldSlot(hotbarIndex);
						}),
					);
				}

				// Scroll to select held item:
				controlsBin.Add(
					Mouse.onScrolled.Connect((event) => {
						if (!this.controlsEnabled || event.uiProcessed || event.IsCancelled()) return;
						if (Mouse.IsOverUI()) return;
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
					}),
				);
			}),
		);
	}

	public OnDisable(): void {
		Airship.Inventory.UnregisterInventory(this);
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
		return Airship.Inventory.localInventory === this;
	}

	private RequestFullUpdate(): void {
		const dto = Airship.Inventory.remotes.clientToServer.getFullUpdate.client.FireServer(this.id);
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

	/**
	 * Observes the slots of this inventory
	 */
	public ObserveSlots(observer: (stack: ItemStack | undefined, index: number) => CleanupFunc) {
		const bin = this.bin.Extend();

		const slotBins = new Map<number, Bin>();
		for (let i = 0; i < this.maxSlots; i++) {
			const atSlot = this.GetItem(i);

			const slotBin = MapUtil.GetOrCreate(slotBins, i, () => bin.Extend());
			const cleanupFn = observer(atSlot, i);
			if (typeIs(cleanupFn, "function")) {
				slotBin.Add(cleanupFn);
			}
		}

		bin.Add(
			this.onSlotChanged.Connect((slot, stack) => {
				const slotBin = MapUtil.GetOrCreate(slotBins, slot, () => bin.Extend());
				slotBin.Clean();

				const result = observer(stack, slot);
				if (typeIs(result, "function")) {
					slotBin.Add(result);
				}
			}),
		);

		return () => bin.Clean();
	}

	public ObserveHeldItem(callback: (itemStack: ItemStack | undefined) => CleanupFunc): Bin {
		const bin = new Bin();
		this.observeHeldItemBins.push(bin);
		let currentItemStack = this.items.get(this.heldSlot);
		let cleanup = callback(currentItemStack);

		bin.Add(
			this.onHeldSlotChanged.Connect((newSlot) => {
				const selected = this.items.get(newSlot);
				if (selected?.itemType === currentItemStack?.itemType) return;

				if (cleanup !== undefined) {
					task.spawn(() => {
						cleanup!();
					});
				}
				currentItemStack = selected;
				task.spawn(() => {
					cleanup = callback(selected);
				});
			}),
		);
		bin.Add(
			this.onSlotChanged.Connect((slot, itemStack) => {
				if (slot === this.heldSlot) {
					if (itemStack?.itemType === currentItemStack?.itemType) return;
					if (cleanup !== undefined) {
						task.spawn(() => {
							cleanup!();
						});
					}
					currentItemStack = itemStack;
					task.spawn(() => {
						cleanup = callback(itemStack);
					});
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
						if (e.noNetwork) return;
						if (Game.IsHosting()) return;

						CoreNetwork.ServerToClient.UpdateInventorySlot.server.FireAllClients(
							this.id,
							slot,
							undefined,
							e.amount,
						);
					}),
				);
				bin.Add(
					itemStack.itemTypeChanged.Connect((e) => {
						if (e.noNetwork) return;
						if (Game.IsHosting()) return;

						CoreNetwork.ServerToClient.UpdateInventorySlot.server.FireAllClients(
							this.id,
							slot,
							e.itemType,
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
			if (itemStack.itemType === itemType) {
				let remaining = amount - counter;
				if (itemStack.amount > remaining) {
					itemStack.SetAmount(itemStack.amount - remaining, {
						noNetwork: Game.IsHosting() && Airship.Inventory.localInventory === this,
					});
					break;
				} else {
					counter += itemStack.amount;
					itemStack.Destroy();
				}
			}
		}
	}

	public StartNetworkingDiffs(): void {
		this.finishedInitialReplication = true;
	}

	public AddItem(itemStack: ItemStack): boolean {
		// OnBeforeAddItem event
		const addItemEvent = new OnBeforeAddItemEvent(itemStack);
		const result = this.onBeforeAddItem.Fire(addItemEvent);
		if (result.IsCancelled()) return false;
		itemStack = addItemEvent.itemStack;

		// Merge with existing
		for (let [otherId, otherItem] of this.items) {
			if (itemStack.CanMerge(otherItem)) {
				otherItem.SetAmount(otherItem.amount + itemStack.amount, {
					noNetwork: Game.IsHosting() && Airship.Inventory.localInventory === this,
				});
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
		} else if (Game.IsServer()) {
			CoreNetwork.ServerToClient.SetHeldInventorySlot.server.FireAllClients(this.id, slot, true);
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

	public GetItemCount(itemType: string): number {
		let total = 0;
		for (let itemStack of Object.values(this.items)) {
			if (itemStack.itemType === itemType) {
				total += itemStack.amount;
			}
		}
		return total;
	}

	public HasEnough(itemType: string, amount: number): boolean {
		return this.GetItemCount(itemType) >= amount;
	}

	public HasItemType(itemType: string): boolean {
		return this.GetItemCount(itemType) > 0;
	}

	public GetMaxSlots(): number {
		return this.maxSlots;
	}

	public GetHotbarSlotCount(): number {
		return this.hotbarSlots;
	}

	public FindSlotWithItemType(itemType: string): number | undefined {
		for (let i = 0; i < this.maxSlots; i++) {
			const itemStack = this.GetItem(i);
			if (itemStack?.itemType === itemType) {
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

	/**
	 * Transfers the given slot to another inventory
	 *
	 * If no {@link targetSlot | `targetSlot`} is provided, it will find the first available slot on the target inventory
	 *
	 * Will return `true` if it swapped successfully
	 */
	public TransferSlotToOtherInventory(
		sourceSlot: number,
		targetInventory: Inventory,
		targetSlot: number = this.GetFirstOpenSlot(),
	): boolean {
		// We can't target invalid slots
		if (targetSlot === -1) return false;

		// If there's nothing here, there's nothing to transfer 🤔
		const stackAtSourceSlot = this.GetItem(sourceSlot);
		if (stackAtSourceSlot === undefined) return false;

		const stackAtTargetSlot = targetInventory.GetItem(targetSlot);

		// Peform a swap, otherwise perform a straight "transfer"
		if (stackAtTargetSlot !== undefined) {
			this.SetItem(sourceSlot, stackAtTargetSlot);
			targetInventory.SetItem(targetSlot, stackAtSourceSlot);
			return true;
		} else {
			this.SetItem(sourceSlot, undefined);
			targetInventory.SetItem(targetSlot, stackAtSourceSlot);
			return true;
		}
	}

	/**
	 * Swaps the contents with {@link slot1 | `slot1`} with {@link slot2 | `slot2`}
	 *
	 * If you want to swap with another inventory's slot, see {@link TransferSlotToOtherInventory | `TransferSlotToOtherInventory`}
	 */
	public SwapSlots(slot1: number, slot2: number) {
		const atSlot1 = this.GetItem(slot1);
		const atSlot2 = this.GetItem(slot2);
		if (atSlot1 === undefined && atSlot2 === undefined) return; // do nothing if both are empty... lol.

		this.SetItem(slot1, atSlot2);
		this.SetItem(slot2, atSlot1);
	}
}
