import { ItemStack } from "Shared/Inventory/ItemStack";
import { TimeUtil } from "Shared/Util/TimeUtil";

export class GroundItemUtil {
	public static CanPickupGroundItem(
		itemStack: ItemStack,
		groundItemNob: NetworkObject,
		characterPosition: Vector3,
	): boolean {
		const dist = characterPosition.sub(groundItemNob.gameObject.transform.position).magnitude;
		if (dist > 1.5) {
			return false;
		}

		const attributes = groundItemNob.gameObject.GetComponent<EasyAttributes>();
		const pickupTime = attributes.GetNumber("pickupTime") ?? 0;
		if (TimeUtil.GetServerTime() < pickupTime) {
			return false;
		}

		return true;
	}
}
