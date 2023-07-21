import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { EntityDamageServerSignal } from "Server/Signals/EntityDamageServerSignal";
import { EntityDeathServerSignal } from "Server/Signals/EntityDeathServerSignal";
import { Entity } from "Shared/Entity/Entity";
import { Network } from "Shared/Network";
import { DEFAULT_RESPAWN_TIME } from "Shared/Respawn/Respawn";
import { DamageType } from "../../../Damage/DamageType";
import { EntityService } from "../Entity/EntityService";
import { ProjectileCollideServerSignal } from "./Projectile/ProjectileCollideServerSignal";

@Service({})
export class DamageService implements OnStart {
	constructor(private readonly entityService: EntityService) {}

	OnStart(): void {
		Network.ClientToServer.TEST_LATENCY.Server.SetCallback((clientId) => {
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
			entityDriver.Impulse(dir.mul(-9).add(new Vector3(0, 11, 0)));
			return InstanceFinder.TimeManager.Tick;
		});
	}

	/**
	 *
	 * @param entity
	 * @param amount
	 * @param config
	 * @returns Returns true if the damage is inflicted. Returns false if event is cancelled.
	 */
	public InflictDamage(
		entity: Entity,
		amount: number,
		config?: {
			damageType?: DamageType;
			fromEntity?: Entity;
			ignoreCancelled?: boolean;
			ignoreImmunity?: boolean;
			projectileHitSignal?: ProjectileCollideServerSignal;
			knockbackDirection?: Vector3;
		},
	): boolean {
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
		ServerSignals.EntityDamage.Fire(damageEvent);
		if (damageEvent.IsCancelled() && !config?.ignoreCancelled) {
			return false;
		}

		let fromPos: Vector3 | undefined = undefined;
		if (config?.fromEntity) {
			fromPos = config.fromEntity.networkObject.gameObject.transform.position;
		}

		print("Sending damage event: " + InstanceFinder.TimeManager.Tick);
		Network.ServerToClient.EntityDamage.Server.FireAllClients(
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
			const entityDeathEvent = new EntityDeathServerSignal(
				entity,
				damageEvent.fromEntity,
				damageEvent,
				DEFAULT_RESPAWN_TIME,
			);
			ServerSignals.EntityDeath.Fire(entityDeathEvent);

			Network.ServerToClient.EntityDeath.Server.FireAllClients(
				entity.id,
				damageEvent.damageType,
				entityDeathEvent.killer?.id,
			);

			this.entityService.DespawnEntity(entity);
			despawned = true;
		} else {
			entity.GrantImmunity(0.3);
		}

		// Knockback
		if (!despawned) {
			const humanoid = entity.networkObject.gameObject.GetComponent<EntityDriver>();
			assert(humanoid, "Missing humanoid");

			// const rigidBody = entity.NetworkObject.gameObject.GetComponent<Rigidbody>();
			// assert(rigidBody, "Missing rigid body.");

			const horizontalScalar = 6;
			const verticalScalar = 10;
			let impulse: Vector3;
			if (config?.knockbackDirection) {
				const delta = config.knockbackDirection.normalized;
				impulse = new Vector3(delta.x * horizontalScalar, verticalScalar, delta.z * horizontalScalar);
			} else if (fromPos) {
				const currentPos = entity.networkObject.transform.position;
				const delta = currentPos.sub(fromPos).normalized;
				impulse = new Vector3(delta.x * horizontalScalar, verticalScalar, delta.z * horizontalScalar);
			} else {
				impulse = new Vector3(0, 9, 0).mul(1);
			}

			humanoid.Impulse(impulse);
		}

		return true;
	}
}
