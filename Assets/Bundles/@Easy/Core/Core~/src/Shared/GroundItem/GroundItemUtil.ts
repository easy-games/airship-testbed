import { TimeUtil } from "@Easy/Core/Shared/Util/TimeUtil";
import { GroundItem } from "./GroundItem";

export class GroundItemUtil {
	public static CanPickupGroundItem(
		groundItem: GroundItem,
		groundItemPosition: Vector3,
		characterPosition: Vector3,
	): boolean {
		const dist = characterPosition.sub(groundItemPosition).magnitude;
		if (dist > 1.5) {
			return false;
		}

		if (TimeUtil.GetServerTime() < groundItem.pickupTime) {
			return false;
		}

		return true;
	}
}
