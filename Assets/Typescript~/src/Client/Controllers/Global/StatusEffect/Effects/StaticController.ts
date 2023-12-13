import { CoreClientSignals } from "@Easy/Core/Client/CoreClientSignals";
import { DamageType } from "@Easy/Core/Shared/Damage/DamageType";
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
import { Controller, OnStart } from "@easy-games/flamework-core";
import { StatusEffectType } from "Shared/StatusEffect/StatusEffectType";
import { StatusEffectController } from "../StatusEffectController";

@Controller({})
export class StaticController implements OnStart {
	constructor(private readonly statusEffectController: StatusEffectController) {}

	OnStart(): void {
		CoreClientSignals.EntityDamage.Connect((event) => {
			if (
				event.fromEntity &&
				event.fromEntity instanceof CharacterEntity &&
				event.damageType === DamageType.ELECTRIC &&
				this.statusEffectController.GetStatusEffectForClient(
					event.fromEntity.ClientId!,
					StatusEffectType.STATIC,
				)
			) {
				// TODO: Play some cool effects here when an entity is hit by an entity
				// that has static.
			}
		});
	}
}
