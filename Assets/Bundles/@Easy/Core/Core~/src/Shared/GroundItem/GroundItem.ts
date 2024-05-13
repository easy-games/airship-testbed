import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";

export interface GroundItemData {
	[name: string]: unknown;
	Grounded?: boolean;
	Spinning?: boolean;
	LocalOffset?: Vector3;
	Direction?: Vector3;
}

export class GroundItem {
	public readonly transform: Transform;
	public shouldMerge = true;

	constructor(
		public readonly id: number,
		public readonly itemStack: ItemStack,
		// public readonly rb: Rigidbody,
		public readonly drop: GroundItemDrop,
		public readonly pickupTime: number,
		public data: GroundItemData,
	) {
		this.transform = drop.transform;
	}

	public SetData(key: string, value: unknown): void {
		this.data[key] = value;
	}

	public GetData<T>(key: string): T | undefined {
		return this.data[key] as T | undefined;
	}
}
