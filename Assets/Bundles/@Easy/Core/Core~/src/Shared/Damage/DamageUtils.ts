import { Entity } from "Shared/Entity/Entity";
import { MathUtil } from "Shared/Util/MathUtil";
import { Task } from "Shared/Util/Task";

export class DamageUtils {
	public static readonly minDamageFallSpeed = 35;
	public static readonly maxDamageFallSpeed = 60;
	public static readonly minFallDamage = 10;
	public static readonly maxFallDamage = 50;

	public static GetFallDamage(verticalSpeed: number): number {
		//Don't damage short falls
		if (math.abs(verticalSpeed) < this.minDamageFallSpeed) {
			return 0;
		}

		return MathUtil.Lerp(this.minFallDamage, this.maxFallDamage, this.GetFallDelta(verticalSpeed));
	}

	public static GetFallDelta(verticalSpeed: number) {
		let speed = math.abs(verticalSpeed) - this.minDamageFallSpeed;
		let max = this.maxDamageFallSpeed - this.minDamageFallSpeed;
		return math.clamp(speed, 0, max) / max;
	}

	public static AddHitstun(entity: Entity, damageAmount: number, OnComplete: () => void) {
		const damageDelta = math.clamp(damageAmount / 50, 0, 1);
		const driver = entity.networkObject.gameObject.GetComponent<EntityDriver>();
		const hitStunDuration = MathUtil.Lerp(0.05, 1.5, damageDelta);
		const hitStunFrequency = MathUtil.Lerp(15, 30, damageDelta);
		const hitStrunRadius = MathUtil.Lerp(0.05, 0.15, damageDelta);

		//Stop entity from moving
		driver.DisableMovement();

		//Shake the entity
		let shake = entity.model.AddComponent<EasyShake>();
		shake.maxRadius = new Vector3(hitStrunRadius, 0, hitStrunRadius);
		shake.duration = hitStunDuration;
		shake.movementsPerSecond = hitStunFrequency;

		Task.Delay(hitStunDuration, () => {
			driver.EnableMovement();
			OnComplete();
		});

		return hitStunDuration;
	}
}
