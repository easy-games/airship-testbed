import { CoreItemType } from "@Easy/Core/Shared/Item/CoreItemType";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { Airship } from "../Airship";
import { ItemDef } from "../Item/ItemDefinitionTypes";

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
	public readonly itemType: string;
	/**
	 * The Item Definition for this ItemStack. This contains metadata related to the itemType.
	 */
	public readonly itemDef: ItemDef;
	public readonly amount: number;
	public readonly changed = new Signal<void>();
	public readonly itemTypeChanged = new Signal<ItemStackTypeChangeSignal>();
	public readonly amountChanged = new Signal<ItemStackAmountChangeSignal>();
	public readonly destroyed = new Signal<ItemStack>();
	private hasBeenDestroyed = false;

	constructor(itemType: string, amount = 1) {
		this.itemType = itemType;
		this.amount = amount;
		this.itemDef = Airship.Inventory.GetItemDef(itemType);
	}

	public SetItemType(itemType: CoreItemType): void {
		(this.itemType as string) = itemType;
		this.itemTypeChanged.Fire({ ItemStack: this, ItemType: itemType, NoNetwork: false });
		this.changed.Fire();
	}

	public SetAmount(
		val: number,
		config?: {
			noNetwork?: boolean;
		},
	): void {
		(this.amount as number) = val;
		this.amountChanged.Fire({ ItemStack: this, NoNetwork: config?.noNetwork ?? false, Amount: val });
		this.changed.Fire();

		if (this.amount <= 0) {
			this.Destroy();
		}
	}

	public CanMerge(other: ItemStack): boolean {
		if (other.itemType !== this.itemType) return false;
		if (other.amount + this.amount > this.GetMaxStackSize()) return false;

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
		return Airship.Inventory.GetItemDef(this.itemType);
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
		return this.itemDef.maxStackSize ?? 999;
	}

	public Clone(): ItemStack {
		const clone = new ItemStack(this.itemType, this.amount);
		return clone;
	}

	public IsDestroyed(): boolean {
		return this.hasBeenDestroyed;
	}
}
