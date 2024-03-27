import { CoreItemType } from "@Easy/Core/Shared/Item/CoreItemType";
import { Signal } from "Shared/Util/Signal";
import { ItemDef } from "../Item/ItemDefinitionTypes";
import { ItemUtil } from "../Item/ItemUtil";

export interface ItemStackDto {
	/** ItemType */
	i: string;

	/** Amount */
	a: number;
}

export type ItemStackTypeChangeSignal = {
	readonly ItemStack: ItemStack;
	readonly NoNetwork: boolean;
	readonly ItemType: CoreItemType;
};

export type ItemStackAmountChangeSignal = {
	readonly ItemStack: ItemStack;
	readonly NoNetwork: boolean;
	readonly Amount: number;
};

export class ItemStack {
	private itemType: string;
	private amount: number;
	public changed = new Signal<void>();
	public itemTypeChanged = new Signal<ItemStackTypeChangeSignal>();
	public amountChanged = new Signal<ItemStackAmountChangeSignal>();
	public destroyed = new Signal<ItemStack>();
	private hasBeenDestroyed = false;

	constructor(itemType: string, amount = 1) {
		this.itemType = itemType;
		this.amount = amount;
	}

	public GetItemType(): string {
		return this.itemType;
	}

	public GetItemDef(): ItemDef {
		return ItemUtil.GetItemDef(this.itemType);
	}

	public SetItemType(itemType: CoreItemType): void {
		this.itemType = itemType;
		this.itemTypeChanged.Fire({ ItemStack: this, ItemType: itemType, NoNetwork: false });
		this.changed.Fire();
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
		this.amountChanged.Fire({ ItemStack: this, NoNetwork: config?.noNetwork ?? false, Amount: val });
		this.changed.Fire();

		if (this.amount <= 0) {
			this.Destroy();
		}
	}

	public CanMerge(other: ItemStack): boolean {
		if (other.GetItemType() !== this.GetItemType()) return false;
		if (other.GetAmount() + this.GetAmount() > this.GetMaxStackSize()) return false;

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

	public GetMeta(): ItemDef {
		return ItemUtil.GetItemDef(this.itemType);
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

		this.itemTypeChanged.DisconnectAll();
		this.amountChanged.DisconnectAll();

		this.destroyed.Fire(this);
		this.destroyed.DisconnectAll();
	}

	public GetMaxStackSize(): number {
		return this.GetItemDef()?.maxStackSize ?? 999;
	}

	public Clone(): ItemStack {
		const clone = new ItemStack(this.itemType, this.amount);
		return clone;
	}

	public IsDestroyed(): boolean {
		return this.hasBeenDestroyed;
	}
}
