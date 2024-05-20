import { CharacterAnimator } from "@Easy/Core/Shared/Character/Animation/CharacterAnimator";
import Character from "@Easy/Core/Shared/Character/Character";
import { LocalCharacterSingleton } from "@Easy/Core/Shared/Character/LocalCharacter/LocalCharacterSingleton";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { MathUtil } from "@Easy/Core/Shared/Util/MathUtil";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Task } from "@Easy/Core/Shared/Util/Task";

export class DamageUtils {
	public static readonly minDamageFallSpeed = 35;
	public static readonly maxDamageFallSpeed = 60;
	public static readonly minFallDamage = 10;
	public static readonly maxFallDamage = 100;
	public static readonly maxHitstunDamage = 50;
	public static readonly minHitStunRadius = 0.08;
	public static readonly maxHitStunRadius = 0.1;

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

	public static AddHitstun(character: Character, damageAmount: number, OnComplete: () => void) {
		//Don't do hit stun for small damage amounts
		if (damageAmount < 25) {
			OnComplete();
			return 0;
		}

		const driver = character.networkObject.gameObject.GetComponent<CharacterMovement>()!;
		const damageDelta = math.clamp(damageAmount / this.maxHitstunDamage, 0, 1);
		const hitStunDuration = this.GetStunDuration(damageDelta);
		const hitStunFrequency = MathUtil.Lerp(30, 60, damageDelta);
		const hitStrunRadius = MathUtil.Lerp(this.minHitStunRadius, this.maxHitStunRadius, damageDelta);

		//Stop entity from moving
		driver.DisableMovement();
		if (character.IsLocalCharacter()) {
			Dependency<LocalCharacterSingleton>().GetCharacterInput()?.SetEnabled(false);
		}

		if (RunUtil.IsClient()) {
			//Shake the entity
			// let shake = character.references.rig.gameObject.AddComponent<EasyShake>();
			// shake.resolveShakeOverTime = true;
			// shake.maxRadius = new Vector3(hitStrunRadius, 0, hitStrunRadius);
			// const minRadius = math.max(this.maxHitStunRadius, hitStrunRadius / 2);
			// shake.minRadius = new Vector3(minRadius, 0, minRadius);
			// shake.duration = hitStunDuration;
			// shake.movementsPerSecond = hitStunFrequency;
		}

		Task.Delay(hitStunDuration, () => {
			driver.EnableMovement();
			if (character.IsLocalCharacter()) {
				Dependency<LocalCharacterSingleton>().GetCharacterInput()?.SetEnabled(true);
			}
			OnComplete();
		});

		return hitStunDuration;
	}

	private static GetStunDuration(damageDelta: number) {
		return MathUtil.Lerp(0.015, 0.15, damageDelta);
	}

	public static AddAttackStun(
		character: Character,
		damageDealt: number,
		disableMovement: boolean,
		vfx: GameObject[] | undefined,
	) {
		const anim = character.animator as CharacterAnimator;
		const driver = character.networkObject.gameObject.GetComponent<CharacterMovement>()!;
		if (anim) {
			const duration = this.GetStunDuration(math.clamp(damageDealt / this.maxHitstunDamage, 0, 1));
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
					if (character.IsLocalCharacter()) {
						Dependency<LocalCharacterSingleton>().GetCharacterInput()?.SetEnabled(false);
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
						if (character.IsLocalCharacter()) {
							Dependency<LocalCharacterSingleton>().GetCharacterInput()?.SetEnabled(true);
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
