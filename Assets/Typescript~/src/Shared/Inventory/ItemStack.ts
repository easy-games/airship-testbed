import { GetItemMeta } from "Shared/Item/ItemDefinitions";
import { ItemMeta } from "Shared/Item/ItemMeta";
import { ItemType } from "Shared/Item/ItemType";
import { Signal } from "Shared/Util/Signal";

export interface ItemStackDto {
	/** ItemType */
	i: ItemType;

	/** Amount */
	a: number;
}

export type ItemStackTypeChangeSignal = {
	readonly ItemStack: ItemStack;
	readonly NoNetwork: boolean;
	readonly ItemType: ItemType;
};

export type ItemStackAmountChangeSignal = {
	readonly ItemStack: ItemStack;
	readonly NoNetwork: boolean;
	readonly Amount: number;
};

export class ItemStack {
	private itemType: ItemType;
	private amount: number;
	public Changed = new Signal<void>();
	public ItemTypeChanged = new Signal<ItemStackTypeChangeSignal>();
	public AmountChanged = new Signal<ItemStackAmountChangeSignal>();
	public Destroyed = new Signal<ItemStack>();
	private hasBeenDestroyed = false;
	public MaxStackSize = 100;

	constructor(itemType: ItemType, amount: number) {
		this.itemType = itemType;
		this.amount = amount;
	}

	public GetItemType(): ItemType {
		return this.itemType;
	}

	public GetItemMeta(): ItemMeta {
		return GetItemMeta(this.itemType);
	}

	public SetItemType(itemType: ItemType): void {
		this.itemType = itemType;
		this.ItemTypeChanged.Fire({ ItemStack: this, ItemType: itemType, NoNetwork: false });
		this.Changed.Fire();
	}

	public GetAmount(): number {
		return this.amount;
	}

	public SetAmount(
		val: number,
		config?: {
			noNetwork?: boolean;
		},
	): void {
		this.amount = val;
		this.AmountChanged.Fire({ ItemStack: this, NoNetwork: config?.noNetwork ?? false, Amount: val });
		this.Changed.Fire();

		if (this.amount <= 0) {
			this.Destroy();
		}
	}

	public CanMerge(other: ItemStack): boolean {
		if (other.GetItemType() !== this.GetItemType()) return false;
		if (other.GetAmount() + this.GetAmount() > this.MaxStackSize) return false;

		return true;
	}

	public Encode(): ItemStackDto {
		return {
			i: this.itemType,
			a: this.amount,
		};
	}

	public static Decode(dto: ItemStackDto): ItemStack {
		const item = new ItemStack(dto.i, dto.a);
		return item;
	}

	public GetMeta(): ItemMeta {
		return GetItemMeta(this.itemType);
	}

	public Decrement(
		amount: number,
		config?: {
			noNetwork?: boolean;
		},
	): void {
		this.SetAmount(math.max(this.amount - amount, 0), {
			noNetwork: config?.noNetwork,
		});
	}

	public Destroy(): void {
		if (this.hasBeenDestroyed) return;

		this.hasBeenDestroyed = true;

		this.ItemTypeChanged.DisconnectAll();
		this.AmountChanged.DisconnectAll();

		this.Destroyed.Fire(this);
		this.Destroyed.DisconnectAll();
	}

	public GetMaxStackSize(): number {
		return this.MaxStackSize;
	}

	public Clone(): ItemStack {
		const clone = new ItemStack(this.itemType, this.amount);
		return clone;
	}

	public IsDestroyed(): boolean {
		return this.hasBeenDestroyed;
	}
}
