import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { DamageService } from "@Easy/Core/Server/Services/Damage/DamageService";
import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { DamageType } from "@Easy/Core/Shared/Damage/DamageType";
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
import { Entity } from "@Easy/Core/Shared/Entity/Entity";
import { OnStart, Service } from "@easy-games/flamework-core";
import { GetStaticDamageByTier, StaticAOERange } from "Shared/StatusEffect/Effects/StaticMeta";
import { GetStatusEffectMeta } from "Shared/StatusEffect/StatusEffectDefinitions";
import { StatusEffectDto } from "Shared/StatusEffect/StatusEffectMeta";
import { StatusEffectType } from "Shared/StatusEffect/StatusEffectType";
import { StatusEffectService } from "../StatusEffectService";

@Service({})
export class StaticService implements OnStart {
	/** Fire Aspect status effect meta. */
	private statusMeta = GetStatusEffectMeta(StatusEffectType.STATIC);

	constructor(
		private readonly statusEffectService: StatusEffectService,
		private readonly damageService: DamageService,
		private readonly entityService: EntityService,
	) {}

	OnStart(): void {
		CoreServerSignals.EntityDamage.Connect((event) => {
			if (event.damageType === this.statusMeta.damageType!) return;
			if (event.damageType === DamageType.FIRE) return;
			if (!event.fromEntity) return;
			if (!(event.fromEntity instanceof CharacterEntity)) return;
			if (event.fromEntity.ClientId === undefined) return;
			const staticStatusEffect = this.statusEffectService.GetStatusEffectForClient(
				event.fromEntity.ClientId,
				StatusEffectType.STATIC,
			);
			if (!staticStatusEffect) return;
			this.HandleStatic(event.entity, event.fromEntity, staticStatusEffect);
		});
	}

	/**
	 * Handles applying static damage to provided entity.
	 *
	 * @param targetEntity The entity static damage is being applied to.
	 * @param fromEntity The entity that is dealing static damage.
	 * @param statusEffect The status effect the `fromEntity` currently has.
	 */
	private HandleStatic(_targetEntity: Entity, fromEntity: Entity, statusEffect: StatusEffectDto): void {
		const damageForTier = GetStaticDamageByTier(statusEffect.tier);
		this.entityService.GetEntities().forEach((entity) => {
			const entityPos = entity.GetCenterOfMass();
			const distanceFromAttacker = entityPos.Distance(fromEntity.GetPosition());
			if (distanceFromAttacker <= StaticAOERange) {
				this.damageService.InflictDamage(entity, damageForTier, {
					fromEntity: fromEntity,
					ignoreImmunity: true,
					damageType: this.statusMeta.damageType!,
					knockbackDirection: new Vector3(0, 0, 0),
				});
			}
		});
	}
}
