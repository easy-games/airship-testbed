import { OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { EntityDamageServerSignal } from "Server/Signals/EntityDamageServerSignal";
import { EntityDeathServerSignal } from "Server/Signals/EntityDeathServerSignal";
import { CoreNetwork } from "Shared/CoreNetwork";
import { DamageType } from "Shared/Damage/DamageType";
import { DamageUtils } from "Shared/Damage/DamageUtils";
import { Entity } from "Shared/Entity/Entity";
import { AOEDamageMeta } from "Shared/Item/ItemMeta";
import { DEFAULT_RESPAWN_TIME } from "Shared/Respawn/Respawn";
import { MathUtil } from "Shared/Util/MathUtil";
import { Task } from "Shared/Util/Task";
import { EntityService } from "../Entity/EntityService";
import { ProjectileCollideServerSignal } from "./Projectile/ProjectileCollideServerSignal";

@Service({})
export class DamageService implements OnStart {
	private combatVars: DynamicVariables = DynamicVariablesManager.Instance.GetVars("Combat")!;

	constructor(private readonly entityService: EntityService) {}

	public GetDefaultKnockbackY(): number {
		return this.combatVars.GetNumber("kbY");
	}

	OnStart(): void {
		CoreNetwork.ClientToServer.TEST_LATENCY.Server.SetCallback((clientId) => {
			print("-----");
			for (const entity of this.entityService.GetEntities()) {
				print(entity.GetDisplayName() + ": " + entity.id);
			}
			print("-----");

			print("Received: " + InstanceFinder.TimeManager.Tick);
			const entity = this.entityService.GetEntityByClientId(clientId);
			if (!entity) return -1;
			const entityDriver = entity.gameObject.GetComponent<EntityDriver>();
			const dir = entity.model.transform.forward;

			this.ApplyKnockback(entityDriver, dir.mul(new Vector3(-1, 1, -1)).add(new Vector3(0, 1, 0)));
			return InstanceFinder.TimeManager.Tick;
		});

		CoreNetwork.ClientToServer.TestKnockback2.Server.OnClientEvent((clientId) => {
			const entity = Entity.FindByClientId(clientId);
			if (entity) {
				const dir = entity.model.transform.forward;
				const horizontalScalar = this.combatVars.GetNumber("kbX");
				const verticalScalar = this.combatVars.GetNumber("kbY");
				entity.entityDriver.SetVelocity(dir.mul(-horizontalScalar).add(new Vector3(0, verticalScalar, 0)));
			}
		});
	}

	public InflictAOEDamage(
		centerPosition: Vector3,
		innerDamage: number,
		aoeMeta: AOEDamageMeta,
		config: InflictDamageConfig,
	) {
		if (!config.knockbackDirection) {
			config.knockbackDirection = Vector3.zero;
		}

		const initialDir = config?.knockbackDirection;
		this.entityService.GetEntities().forEach((entity) => {
			const centerOfMass = entity.GetCenterOfMass();
			const distance = centerOfMass.Distance(centerPosition);
			if (distance < aoeMeta.damageRadius) {
				const delta = distance / aoeMeta.damageRadius;
				let damage = MathUtil.Lerp(innerDamage, aoeMeta.outerDamage, delta * delta);
				const knockbackStrength = MathUtil.Lerp(1, 2, delta);
				config.knockbackDirection = centerOfMass.sub(centerPosition).normalized;
				if (
					aoeMeta.selfKnockbackMultiplier &&
					aoeMeta.selfKnockbackMultiplier > 0 &&
					entity.id === config.fromEntity?.id
				) {
					//Hitting self with AOE explosive
					damage *= 0.5;
					config.canDamageAllies = true;
					config.knockbackDirection = config.knockbackDirection
						.mul(aoeMeta.selfKnockbackMultiplier)
						.mul(this.combatVars.GetNumber("kbSelfMultiplier"));
				} else {
					//Entity is within range of hitting
					config.canDamageAllies = false;
					config.knockbackDirection = config.knockbackDirection.mul(knockbackStrength);
				}
				this.InflictDamage(entity, damage, config);
			}
		});
	}

	public InflictFallDamage(entity: Entity, verticalSpeed: number): boolean {
		const damage = DamageUtils.GetFallDamage(verticalSpeed);
		if (damage <= 0) {
			return false;
		}

		//Scale damage based on how hard player hit the ground
		return this.InflictDamage(entity, damage, { knockbackDirection: Vector3.zero, damageType: DamageType.FALL });
	}

	/**
	 *
	 * @param entity
	 * @param amount
	 * @param config
	 * @returns Returns true if the damage is inflicted. Returns false if event is cancelled.
	 */
	public InflictDamage(entity: Entity, amount: number, config?: InflictDamageConfig): boolean {
		if (entity.HasImmunity() && !config?.ignoreImmunity) {
			return false;
		}
		if (entity.IsDead()) {
			return false;
		}

		const damageEvent = new EntityDamageServerSignal(
			entity,
			amount,
			config?.damageType ?? DamageType.SWORD,
			config?.fromEntity,
			config?.canDamageAllies,
		);
		CoreServerSignals.EntityDamage.Fire(damageEvent);
		if (damageEvent.IsCancelled() && !config?.ignoreCancelled) {
			return false;
		}

		CoreNetwork.ServerToClient.EntityDamage.Server.FireAllClients(
			entity.id,
			damageEvent.amount,
			damageEvent.damageType,
			damageEvent.fromEntity?.id,
		);

		const damageBefore = amount;
		const armor = entity.GetArmor();
		if (armor > 0) {
			amount = amount * (100 / (100 + armor));
			//print("mitigated damage: " + (damageBefore - amount));
		}

		let despawned = false;
		entity.SetHealth(entity.GetHealth() - amount);
		entity.SetLastDamagedTime(Time.time);
		const dead = entity.GetHealth() === 0;
		if (dead) {
			entity.Kill();
			entity.entityDriver.disableInput = true;
			const entityDeathEvent = new EntityDeathServerSignal(
				entity,
				damageEvent.fromEntity,
				damageEvent,
				DEFAULT_RESPAWN_TIME,
			);
			CoreServerSignals.EntityDeath.Fire(entityDeathEvent);

			CoreNetwork.ServerToClient.EntityDeath.Server.FireAllClients(
				entity.id,
				damageEvent.damageType,
				entityDeathEvent.killer?.id,
				entityDeathEvent.respawnTime,
			);

			//Let the death animation play before despawning
			entity.GrantImmunity(3);
			Task.Delay(2, () => {
				this.entityService.DespawnEntity(entity);
				despawned = true;
			});
		} else {
			entity.GrantImmunity(0.3);

			//Hit stun and Knockback
			const driver = entity.networkObject.gameObject.GetComponent<EntityDriver>();
			if (driver) {
				//DamageUtils.AddHitstun(entity, amount, () => {
				this.ApplyKnockback(driver, config?.knockbackDirection);
				//});
			}
		}

		return true;
	}

	public ApplyKnockback(driver: EntityDriver, knockbackVel: Vector3 | undefined) {
		let horizontalScalar = this.combatVars.GetNumber("kbX");
		let verticalScalar = this.combatVars.GetNumber("kbY");

		// if (!driver.IsGrounded()) {
		// 	verticalScalar *= 0.6;
		// 	horizontalScalar *= 0.6;
		// }

		let impulse: Vector3;
		const delta = knockbackVel ?? new Vector3(0, 0, 0);

		impulse = new Vector3(delta.x * horizontalScalar, delta.y * verticalScalar, delta.z * horizontalScalar);

		driver.ApplyImpulse(impulse);
	}
}

export interface InflictDamageConfig {
	damageType?: DamageType;
	fromEntity?: Entity;
	ignoreCancelled?: boolean;
	ignoreImmunity?: boolean;
	projectileHitSignal?: ProjectileCollideServerSignal;
	/**
	 * Applies standardized knockback in a given direction.
	 *
	 * You should usually use y=1 for this.
	 * */
	knockbackDirection?: Vector3;
	canDamageAllies?: boolean;
}
