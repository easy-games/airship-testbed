import { ItemStack } from "Shared/Inventory/ItemStack";

export class GroundItem {
	constructor(
		public readonly id: number,
		public readonly itemStack: ItemStack,
		public readonly rb: Rigidbody,
		public readonly pickupTime: number,
		public data: Record<string, unknown>,
	) {}

	public SetData(key: string, value: unknown): void {
		this.data[key] = value;
	}

	public GetData<T>(key: string): T | undefined {
		return this.data[key] as T | undefined;
	}
}
