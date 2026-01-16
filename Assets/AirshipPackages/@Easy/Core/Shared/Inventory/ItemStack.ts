import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { Airship } from "../Airship";
import { ItemDef } from "../Item/ItemDefinitionTypes";
import ObjectUtils from "../Util/ObjectUtils";

export interface ItemStackDto {
	/** ItemType */
	i: string;

	/** Amount */
	a: number;

	/** Optional custom data (example adding weight to an item stack */
	c?: Record<string, unknown>;
}

export type ItemStackTypeChangeSignal = {
	readonly itemStack: ItemStack;
	readonly noNetwork: boolean;
	readonly itemType: string;
};

export type ItemStackAmountChangeSignal = {
	readonly itemStack: ItemStack;
	readonly noNetwork: boolean;
	readonly amount: number;
};

export class ItemStack {
	public readonly itemType: string;
	/**
	 * The Item Definition for this ItemStack. This contains metadata related to the itemType.
	 */
	public readonly itemDef: ItemDef;
	public readonly amount: number;
	/**
	 * Optional custom data for this ItemStack that can be used to store
	 * instance-specific data that differs between items of the same type.
	 */
	public readonly customData?: Record<string, unknown>;
	public readonly changed = new Signal<void>();
	public readonly itemTypeChanged = new Signal<ItemStackTypeChangeSignal>();
	public readonly amountChanged = new Signal<ItemStackAmountChangeSignal>();
	public readonly destroyed = new Signal<ItemStack>();
	private hasBeenDestroyed = false;

	constructor(itemType: string, amount = 1, customData?: Record<string, unknown>) {
		this.itemType = itemType;
		this.amount = amount;
		this.itemDef = Airship.Inventory.GetItemDef(itemType);
		this.customData = customData;
	}

	public SetItemType(itemType: string): void {
		(this.itemType as string) = itemType;
		(this.itemDef as ItemDef) = Airship.Inventory.GetItemDef(itemType);
		this.itemTypeChanged.Fire({ itemStack: this, itemType: itemType, noNetwork: false });
		this.changed.Fire();
	}

	public SetAmount(
		val: number,
		config?: {
			noNetwork?: boolean;
		},
	): void {
		(this.amount as number) = val;
		this.amountChanged.Fire({ itemStack: this, noNetwork: config?.noNetwork ?? false, amount: val });
		this.changed.Fire();

		if (this.amount <= 0) {
			this.Destroy();
		}
	}

	/**
	 * @Deprecated Inventory now handles merging by first attempting to merge with existing items, then adding to the first open slot if there is a remainder.
	 * Checks if the ItemStacks can be merged.
	 * @param other The ItemStack to check if it can be merged with this ItemStack
	 * @returns True if the ItemStacks can be merged, false otherwise
	 */
	public CanMerge(other: ItemStack): boolean {
		if (other.itemType !== this.itemType) return false;
		if (other.amount + this.amount > this.GetMaxStackSize()) return false;

		return true;
	}

	public Encode(): ItemStackDto {
		const dto: ItemStackDto = {
			i: this.itemType,
			a: this.amount,
		};
		if (this.customData !== undefined) {
			dto.c = this.customData;
		}
		return dto;
	}

	public static Decode(dto: ItemStackDto): ItemStack {
		const item = new ItemStack(dto.i, dto.a, dto.c);
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
		return this.itemDef.maxStackSize ?? math.huge;
	}

	public Clone(): ItemStack {
		const clone = new ItemStack(
			this.itemType,
			this.amount,
			this.customData ? ObjectUtils.deepCopy(this.customData) : undefined,
		);
		return clone;
	}

	public IsDestroyed(): boolean {
		return this.hasBeenDestroyed;
	}
}
