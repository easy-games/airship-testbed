import { Dependency } from "@easy-games/flamework-core";
import { AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";
import { AbilityDto } from "./Ability";

export class AbilityUtil {
	/**
	 * Creates an ability data transfer object based on ability id and enabled state.
	 *
	 * @param abilityId The ability's id.
	 * @param enabled Whether or not the ability is _currently_ enabled.
	 */
	public static CreateAbilityDto(abilityId: string, enabled: boolean): AbilityDto | undefined {
		const abilityMeta = Dependency<AbilityRegistry>().GetAbilityById(abilityId);
		if (!abilityMeta) return undefined;
		return {
			abilityId: abilityId,
			enabled: enabled,
			slot: abilityMeta.config.slot,
			charging: abilityMeta.config.charge,
		};
	}
}
