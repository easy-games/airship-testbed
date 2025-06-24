import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import Object from "@Easy/Core/Shared/Util/ObjectUtils";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { Game } from "../Game";
import { Player } from "../Player/Player";
import { Cancellable } from "../Util/Cancellable";
import { MapUtil } from "../Util/MapUtil";
import { DraggingState } from "./AirshipDraggingState";
import { ItemStack, ItemStackDto } from "./ItemStack";

export interface InventoryDto {
	id: number;
	items: Map<number, ItemStackDto>;
}

export const enum InventoryModifyPermission {
	NetworkOwner = "OWNER",
	Everyone = "ALL",
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

	@Header("Permissions")
	@Tooltip(
		"Who can modify this inventory\n\n<b>Network Owner</b>: The network owner of this Inventory's NetworkIdentity\n<b>Everyone</b>: Any client can modify the inventory",
	)
	@SerializeField()
	protected modifyPermission = InventoryModifyPermission.NetworkOwner;

	@NonSerialized() private items = new Map<number, ItemStack>();

	/** Fired at the start of AddItem. Can be used to modify the added ItemStack or cancel the operation. */
	@NonSerialized() public readonly onBeforeAddItem = new Signal<OnBeforeAddItemEvent>();
	/** Fired when a `slot` points to a new `ItemStack`. Changes to the same ItemStack will **not** fire this event. */
	@NonSerialized() public readonly onSlotChanged = new Signal<[slot: number, itemStack: ItemStack | undefined]>();

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
		};

		const StartServer = () => {
			// print("NetID (OnStartServer): " + this.networkIdentity.netId);
			this.id = this.networkIdentity.netId;
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
	}

	public OnDisable(): void {
		Airship.Inventory.UnregisterInventory(this);
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
							e.itemStack.itemType,
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
							e.itemStack.amount,
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

	public Encode(): InventoryDto {
		let mappedItems = new Map<number, ItemStackDto>();
		for (let item of this.items) {
			mappedItems.set(item[0], item[1].Encode());
		}
		return {
			id: this.id,
			items: mappedItems,
		};
	}

	public ProcessDto(dto: InventoryDto): void {
		this.id = dto.id;
		for (let pair of dto.items) {
			this.SetItem(pair[0], ItemStack.Decode(pair[1]));
		}
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

	/**
	 * Finds the first slot with the given item type, or undefined if there is none
	 * @param itemType The item type you want to find the slot of
	 */
	public FindSlotWithItemType(itemType: string): number | undefined {
		for (let i = 0; i < this.maxSlots; i++) {
			const itemStack = this.GetItem(i);
			if (itemStack?.itemType === itemType) {
				return i;
			}
		}
		return undefined;
	}

	/**
	 * Finds the first mergable slot with the given item type, or undefined if there is none
	 * @param itemType The item type of what you want to merge
	 * @param [amount=1] The amount of the item you want to merge
	 */
	public FindMergeableSlotWithItemType(itemType: string, amount = 1): number | undefined {
		for (let i = 0; i < this.maxSlots; i++) {
			const itemStack = this.GetItem(i);
			if (itemStack?.itemType === itemType && itemStack.amount + amount <= itemStack.GetMaxStackSize()) {
				return i;
			}
		}
		return undefined;
	}

	/**
	 * Finds the first mergable slot with the given item stack, or undefined if there is none
	 * @param stackToMerge The stack you are wanting to merge into this inventory
	 */
	public FindMergableSlot(stackToMerge: ItemStack): number | undefined {
		const itemType = stackToMerge.itemType;
		const amount = stackToMerge.amount;

		for (let i = 0; i < this.maxSlots; i++) {
			const itemStack = this.GetItem(i);
			if (itemStack?.itemType === itemType && itemStack.amount + amount <= itemStack.GetMaxStackSize()) {
				return i;
			}
		}
		return undefined;
	}

	public GetAllItems(): ItemStack[] {
		return Object.values(this.items);
	}

	/**
	 * Gets the value of the {@link modifyPermission | Modify Permission} property for this inventory
	 */
	public GetModifyPermission(): InventoryModifyPermission {
		return this.modifyPermission;
	}

	/**
	 * Returns true if the player has permissions to modify this inventory
	 * @param player
	 * @returns
	 */
	public CanPlayerModifyInventory(player: Player): boolean {
		const permission = this.modifyPermission;
		if (permission === InventoryModifyPermission.NetworkOwner) {
			return Game.IsClient()
				? player === Game.localPlayer && this.networkIdentity.isOwned
				: this.networkIdentity.connectionToClient?.connectionId === player.connectionId;
		} else {
			return true;
		}
	}
}
