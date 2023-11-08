import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
import { CharacterEntityAnimator } from "Shared/Entity/Animation/CharacterEntityAnimator";
import { Entity } from "Shared/Entity/Entity";
import { MathUtil } from "Shared/Util/MathUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { Task } from "Shared/Util/Task";

export class DamageUtils {
	public static readonly minDamageFallSpeed = 35;
	public static readonly maxDamageFallSpeed = 60;
	public static readonly minFallDamage = 10;
	public static readonly maxFallDamage = 50;
	public static readonly maxHitstunDamage = 50;

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
		const driver = entity.networkObject.gameObject.GetComponent<EntityDriver>();
		const damageDelta = math.clamp(damageAmount / this.maxHitstunDamage, 0, 1);
		const hitStunDuration = this.GetStunDuration(damageDelta);
		const hitStunFrequency = MathUtil.Lerp(20, 40, damageDelta);
		const hitStrunRadius = MathUtil.Lerp(0.06, 0.15, damageDelta);

		//Stop entity from moving
		driver.DisableMovement();
		if (entity.IsLocalCharacter()) {
			Dependency<LocalEntityController>().GetEntityInput()?.SetEnabled(false);
		}

		if (RunUtil.IsClient()) {
			//Shake the entity
			let shake = entity.references.rig.gameObject.AddComponent<EasyShake>();
			shake.resolveShakeOverTime = true;
			shake.maxRadius = new Vector3(hitStrunRadius, 0, hitStrunRadius);
			shake.minRadius = shake.maxRadius.div(2);
			shake.duration = hitStunDuration;
			shake.movementsPerSecond = hitStunFrequency;
		}

		Task.Delay(hitStunDuration, () => {
			driver.EnableMovement();
			if (entity.IsLocalCharacter()) {
				Dependency<LocalEntityController>().GetEntityInput()?.SetEnabled(true);
			}
			OnComplete();
		});

		return hitStunDuration;
	}

	private static GetStunDuration(damageDelta: number) {
		return MathUtil.Lerp(0.02, 0.2, damageDelta);
	}

	public static AddAttackStun(entity: Entity, damageDealt: number) {
		const anim = entity.animator as CharacterEntityAnimator;
		if (anim) {
			const duration = this.GetStunDuration(damageDealt / this.maxHitstunDamage);
			if (duration >= 0.05) {
				anim.SetPlaybackSpeed(0.1);
				Task.Delay(duration, () => {
					anim.SetPlaybackSpeed(1);
				});
			}
		}
	}
}
