import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
import { CharacterEntityAnimator } from "Shared/Entity/Animation/CharacterEntityAnimator";
import { Entity } from "Shared/Entity/Entity";
import { MathUtil } from "Shared/Util/MathUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { Task } from "Shared/Util/Task";

export class DamageUtils {
	public static readonly MinDamageFallSpeed = 35;
	public static readonly MaxDamageFallSpeed = 60;
	public static readonly MinFallDamage = 10;
	public static readonly MaxFallDamage = 100;
	public static readonly MaxHitstunDamage = 50;
	public static readonly MinHitStunRadius = 0.08;
	public static readonly MaxHitStunRadius = 0.1;

	public static GetFallDamage(verticalSpeed: number): number {
		//Don't damage short falls
		if (math.abs(verticalSpeed) < this.MinDamageFallSpeed) {
			return 0;
		}

		return MathUtil.Lerp(this.MinFallDamage, this.MaxFallDamage, this.GetFallDelta(verticalSpeed));
	}

	public static GetFallDelta(verticalSpeed: number) {
		let speed = math.abs(verticalSpeed) - this.MinDamageFallSpeed;
		let max = this.MaxDamageFallSpeed - this.MinDamageFallSpeed;
		return math.clamp(speed, 0, max) / max;
	}

	public static AddHitstun(entity: Entity, damageAmount: number, OnComplete: () => void) {
		//Don't do hit stun for small damage amounts
		if (damageAmount < 25) {
			OnComplete();
			return 0;
		}

		const driver = entity.NetworkObject.gameObject.GetComponent<EntityDriver>();
		const damageDelta = math.clamp(damageAmount / this.MaxHitstunDamage, 0, 1);
		const hitStunDuration = this.GetStunDuration(damageDelta);
		const hitStunFrequency = MathUtil.Lerp(30, 60, damageDelta);
		const hitStrunRadius = MathUtil.Lerp(this.MinHitStunRadius, this.MaxHitStunRadius, damageDelta);

		//Stop entity from moving
		driver.DisableMovement();
		if (entity.IsLocalCharacter()) {
			Dependency<LocalEntityController>().GetEntityInput()?.SetEnabled(false);
		}

		if (RunUtil.IsClient()) {
			//Shake the entity
			let shake = entity.References.Rig.gameObject.AddComponent<EasyShake>();
			shake.resolveShakeOverTime = true;
			shake.maxRadius = new Vector3(hitStrunRadius, 0, hitStrunRadius);
			const minRadius = math.max(this.MaxHitStunRadius, hitStrunRadius / 2);
			shake.minRadius = new Vector3(minRadius, 0, minRadius);
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
		return MathUtil.Lerp(0.015, 0.15, damageDelta);
	}

	public static AddAttackStun(
		entity: Entity,
		damageDealt: number,
		disableMovement: boolean,
		vfx: GameObject[] | undefined,
	) {
		const anim = entity.Animator as CharacterEntityAnimator;
		const driver = entity.NetworkObject.gameObject.GetComponent<EntityDriver>();
		if (anim) {
			const duration = this.GetStunDuration(math.clamp(damageDealt / this.MaxHitstunDamage, 0, 1));
			let particles: ParticleSystem[] = [];
			if (vfx) {
				let particleI = 0;
				vfx.forEach((go) => {
					const newParticles = go.GetComponentsInChildren<ParticleSystem>();
					for (let i = 0; i < newParticles.Length; i++) {
						particles[particleI] = newParticles.GetValue(i);
						particleI++;
					}
				});
			}

			if (duration >= 0.05) {
				anim.SetPlaybackSpeed(0.05);
				if (disableMovement) {
					driver.DisableMovement();
					if (entity.IsLocalCharacter()) {
						Dependency<LocalEntityController>().GetEntityInput()?.SetEnabled(false);
					}
				}
				for (let i = 0; i < particles.size(); i++) {
					let system = particles[i].main;
					system.simulationSpeed = 0.05;
				}
				Task.Delay(duration, () => {
					anim.SetPlaybackSpeed(1);
					if (disableMovement) {
						driver.EnableMovement();
						if (entity.IsLocalCharacter()) {
							Dependency<LocalEntityController>().GetEntityInput()?.SetEnabled(true);
						}
					}
					for (let i = 0; i < particles.size(); i++) {
						let system = particles[i].main;
						system.simulationSpeed = 1;
					}
				});
			}
		}
	}
}
