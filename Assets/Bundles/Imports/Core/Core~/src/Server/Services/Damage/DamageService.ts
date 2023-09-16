import { OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { EntityDamageServerSignal } from "Server/Signals/EntityDamageServerSignal";
import { EntityDeathServerSignal } from "Server/Signals/EntityDeathServerSignal";
import { CoreNetwork } from "Shared/CoreNetwork";
import { DamageType } from "Shared/Damage/DamageType";
import { Entity } from "Shared/Entity/Entity";
import { DEFAULT_RESPAWN_TIME } from "Shared/Respawn/Respawn";
import { Task } from "Shared/Util/Task";
import { EntityService } from "../Entity/EntityService";
import { ProjectileCollideServerSignal } from "./Projectile/ProjectileCollideServerSignal";
import { MathUtil } from "Shared/Util/MathUtil";
import { AOEDamageMeta } from "Shared/Item/ItemMeta";

@Service({})
export class DamageService implements OnStart {
	private combatVars: DynamicVariables = DynamicVariablesManager.Instance.GetVars("Combat")!;

	constructor(private readonly entityService: EntityService) {}

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

			const horizontalScalar = this.combatVars.GetNumber("kbX");
			const verticalScalar = this.combatVars.GetNumber("kbY");
			const kbDuration = this.combatVars.GetNumber("kbDuration");
			entityDriver.ApplyVelocityOverTime(
				dir.mul(-horizontalScalar).add(new Vector3(0, verticalScalar, 0)),
				kbDuration,
			);
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

	public InflictAOEDamage(centerPosition: Vector3, innerDamage: number, aoeMeta: AOEDamageMeta, config: DamageMeta) {
		if (!config.knockbackDirection) {
			config.knockbackDirection = Vector3.zero;
		}

		const initialDir = config?.knockbackDirection;
		this.entityService.GetEntities().forEach((value) => {
			const distance = value.model.transform.position.Distance(centerPosition);
			if (distance < aoeMeta.damageRadius) {
				const delta = distance / aoeMeta.damageRadius;
				const damage = MathUtil.Lerp(innerDamage, aoeMeta.outerDamage, delta);
				const knockbackStrength = MathUtil.Lerp(1, 2, delta);
				config.knockbackDirection = value.model.transform.position
					.sub(centerPosition)
					.normalized.mul(knockbackStrength);
				this.InflictDamage(value, damage, config);
			}
		});
	}

	/**
	 *
	 * @param entity
	 * @param amount
	 * @param config
	 * @returns Returns true if the damage is inflicted. Returns false if event is cancelled.
	 */
	public InflictDamage(entity: Entity, amount: number, config?: DamageMeta): boolean {
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
		);
		CoreServerSignals.EntityDamage.Fire(damageEvent);
		if (damageEvent.IsCancelled() && !config?.ignoreCancelled) {
			return false;
		}

		let fromPos: Vector3 | undefined = undefined;
		if (config?.fromEntity) {
			fromPos = config.fromEntity.networkObject.gameObject.transform.position;
		}

		CoreNetwork.ServerToClient.EntityDamage.Server.FireAllClients(
			entity.id,
			damageEvent.amount,
			damageEvent.damageType,
			damageEvent.fromEntity?.id,
		);

		let despawned = false;
		entity.SetHealth(entity.GetHealth() - amount);
		entity.SetLastDamagedTime(Time.time);
		if (entity.GetHealth() === 0) {
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
		}

		// Knockback
		if (!despawned) {
			const humanoid = entity.networkObject.gameObject.GetComponent<EntityDriver>();
			assert(humanoid, "Missing humanoid");

			// const rigidBody = entity.NetworkObject.gameObject.GetComponent<Rigidbody>();
			// assert(rigidBody, "Missing rigid body.");

			const horizontalScalar = this.combatVars.GetNumber("kbX");
			const verticalScalar = this.combatVars.GetNumber("kbY");
			const kbDuration = this.combatVars.GetNumber("kbDuration");
			let impulse: Vector3;
			if (config?.knockbackDirection) {
				const delta = config.knockbackDirection;
				impulse = new Vector3(delta.x * horizontalScalar, verticalScalar, delta.z * horizontalScalar);
			} else if (fromPos) {
				const currentPos = entity.networkObject.transform.position;
				const delta = currentPos.sub(fromPos).normalized;
				impulse = new Vector3(delta.x * horizontalScalar, verticalScalar, delta.z * horizontalScalar);
			} else {
				impulse = new Vector3(0, 9, 0).mul(1);
			}

			humanoid.ApplyVelocityOverTime(impulse, kbDuration);
		}

		return true;
	}
}

export interface DamageMeta {
	damageType?: DamageType;
	fromEntity?: Entity;
	ignoreCancelled?: boolean;
	ignoreImmunity?: boolean;
	projectileHitSignal?: ProjectileCollideServerSignal;
	knockbackDirection?: Vector3;
}
