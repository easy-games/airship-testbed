import { Entity } from "Shared/Entity/Entity";
import { ItemMeta } from "Shared/Item/ItemMeta";
import { MathUtil } from "Shared/Util/MathUtil";
import { NormalizeV3 } from "Shared/Util/Vector3Util";

export class ProjectileUtil {
	public static GetLaunchPosition(gos: GameObject[], entity: Entity, isInFirstPerson: boolean) {
		let launchPos: Vector3 | undefined;

		for (const handObject of gos) {
			const shootPosition = handObject.transform.FindChild("ShootPosition");
			if (shootPosition) {
				launchPos = shootPosition.transform.position;
			}
		}
		if (!launchPos) {
			if (isInFirstPerson) {
				launchPos = entity.LocalOffsetToWorldPoint(new Vector3(1, -0.5, 0));
			} else {
				launchPos = entity.GetMiddlePosition();
			}
		}

		return launchPos;
	}

	public static GetLaunchForceData(itemMeta: ItemMeta, aimVector: Vector3, chargeSec: number) {
		let chargePercent = 1;
		if (itemMeta.usable) {
			chargePercent = MathUtil.InvLerp(
				0,
				itemMeta.usable.maxChargeSeconds ?? 0,
				math.min(chargeSec, itemMeta.usable.maxChargeSeconds ?? 0),
			);
		}

		const adjustedPower = MathUtil.Lerp(
			itemMeta.projectileLauncher!.minVelocityScaler,
			itemMeta.projectileLauncher!.maxVelocityScaler,
			chargePercent,
		);

		const normalizedAimVector = NormalizeV3(aimVector);

		return {
			direction: normalizedAimVector,
			initialVelocity: normalizedAimVector.mul(adjustedPower),
		};
	}
}
