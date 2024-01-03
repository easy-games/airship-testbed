import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { DamageService } from "@Easy/Core/Server/Services/Damage/DamageService";
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
import { Entity } from "@Easy/Core/Shared/Entity/Entity";
import { OnStart, Service } from "@easy-games/flamework-core";
import { FireDuration, FireTickRate, GetFireDamageByTier } from "Shared/StatusEffect/Effects/FireAspectMeta";
import { GetStatusEffectMeta } from "Shared/StatusEffect/StatusEffectDefinitions";
import { StatusEffectDto } from "Shared/StatusEffect/StatusEffectMeta";
import { StatusEffectType } from "Shared/StatusEffect/StatusEffectType";
import { StatusEffectService } from "../StatusEffectService";

@Service({})
export class FireAspectService implements OnStart {
	/** Mapping of entity id to whether or not entity is **currently** on fire. */
	private entitiesOnFire = new Map<number, boolean>();
	/** Fire Aspect status effect meta. */
	private statusMeta = GetStatusEffectMeta(StatusEffectType.FIRE_ASPECT);

	constructor(
		private readonly statusEffectService: StatusEffectService,
		private readonly damageService: DamageService,
	) {}

	OnStart(): void {
		CoreServerSignals.EntityDamage.Connect((event) => {
			if (event.damageType === this.statusMeta.damageType!) return;
			if (!event.fromEntity) return;
			if (!(event.fromEntity instanceof CharacterEntity)) return;
			if (event.fromEntity.clientId === undefined) return;
			const fireAspectStatusEffect = this.statusEffectService.GetStatusEffectForClient(
				event.fromEntity.clientId,
				StatusEffectType.FIRE_ASPECT,
			);
			if (!fireAspectStatusEffect) return;
			this.HandleFireAspect(event.entity, event.fromEntity, fireAspectStatusEffect);
		});
		CoreServerSignals.EntityDeath.Connect((event) => {
			this.entitiesOnFire.delete(event.entity.id);
		});
	}

	/**
	 * Handles applying ticking fire damage to provided entity. If the entity is already on
	 * fire, this function **immediately** returns.
	 *
	 * @param targetEntity The entity fire damage is being applied to.
	 * @param fromEntity The entity that is dealing fire damage.
	 * @param statusEffect The status effect the `fromEntity` currently has.
	 */
	private HandleFireAspect(targetEntity: Entity, fromEntity: Entity, statusEffect: StatusEffectDto): void {
		if (this.IsEntityOnFire(targetEntity)) return;
		task.spawn(() => {
			this.entitiesOnFire.set(targetEntity.id, true);
			let elapsed = 0;
			while (elapsed < FireDuration && this.IsEntityOnFire(targetEntity)) {
				task.wait(FireTickRate);
				elapsed++;
				const damageForTier = GetFireDamageByTier(statusEffect.tier);
				this.damageService.InflictDamage(targetEntity, damageForTier, {
					fromEntity: fromEntity,
					ignoreImmunity: true,
					damageType: this.statusMeta.damageType!,
					knockbackDirection: new Vector3(0, 0, 0),
				});
			}
			this.entitiesOnFire.set(targetEntity.id, false);
		});
	}

	/**
	 * Returns whether or not provided entity is **currently** on fire.
	 *
	 * @param entity The entity that is being queried.
	 * @returns Whether or not entity is **currently** on fire.
	 */
	public IsEntityOnFire(entity: Entity): boolean {
		return this.entitiesOnFire.get(entity.id) ?? false;
	}
}
