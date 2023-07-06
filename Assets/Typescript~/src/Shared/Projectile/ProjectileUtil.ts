import { Entity } from "Shared/Entity/Entity";
import { ItemMeta } from "Shared/Item/ItemMeta";
import { MathUtil } from "Shared/Util/MathUtil";
import { NormalizeV3 } from "Shared/Util/Vector3Util";

export class ProjectileUtil {
	public static GetLaunchPosition(entity: Entity, isInFirstPerson: boolean) {
		let launchPos: Vector3 | undefined;

		const handObjects = entity.GetAccessoryGameObjects(AccessorySlot.RightHand);
		for (const handObject of handObjects) {
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
		const chargePercent = MathUtil.InvLerp(
			0,
			itemMeta.itemMechanics.maxChargeSeconds,
			math.min(chargeSec, itemMeta.itemMechanics.maxChargeSeconds),
		);

		const adjustedPower = MathUtil.Lerp(
			itemMeta.ProjectileLauncher!.minVelocityScaler,
			itemMeta.ProjectileLauncher!.maxVelocityScaler,
			chargePercent,
		);

		const normalizedAimVector = NormalizeV3(aimVector);

		return {
			direction: normalizedAimVector,
			initialVelocity: normalizedAimVector.mul(adjustedPower),
		};
	}
}
