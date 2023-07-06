import { ItemStack } from "Shared/Inventory/ItemStack";
import { Player } from "Shared/Player/Player";
import { Cancellable } from "Shared/Util/Cancellable";

export class BeforeBlockHitSignal extends Cancellable {
	constructor(
		public readonly BlockPos: Vector3,
		public readonly Player: Player,
		/**
		 * To modify the damage you must edit BlockHitDamageCalc()
		 */
		public readonly Damage: number,
		public readonly ItemInHand: ItemStack,
	) {
		super();
	}
}
