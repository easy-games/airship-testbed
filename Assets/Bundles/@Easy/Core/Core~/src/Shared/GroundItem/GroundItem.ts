import { ItemStack } from "Shared/Inventory/ItemStack";

export class GroundItem {
	public readonly transform: Transform;

	constructor(
		public readonly id: number,
		public readonly itemStack: ItemStack,
		// public readonly rb: Rigidbody,
		public readonly drop: GroundItemDrop,
		public readonly pickupTime: number,
		public data: Record<string, unknown>,
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
