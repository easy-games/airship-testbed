import { Ability, AbilityConfig } from "Shared/Strollers/Abilities/AbilityRegistry";
import { AbilityLogic } from "./AbilityLogic";
import { AbilitySlot } from "./AbilitySlot";
import { MapUtil } from "Shared/Util/MapUtil";

export class CharacterAbilities {
	private boundAbilities = new Map<AbilitySlot, Map<string, AbilityLogic>>();

	/**
	 * Adds the given ability to the character
	 * @param abilityId The ability's unique id
	 * @param slot The slot the ability is bound to
	 * @param logic The logic of the ability
	 */
	public AddAbilityWithId(abilityId: string, slot: AbilitySlot, logic: AbilityLogic) {
		const abilityMap = MapUtil.GetOrCreate(this.boundAbilities, slot, () => new Map<string, AbilityLogic>());
		abilityMap.set(abilityId, logic);
	}

	/**
	 * Gets all abilities bound to the given slot
	 * @param slot The slot
	 * @returns All the abilities bound to this slot
	 */
	public GetAbilitiesBoundToSlot(slot: AbilitySlot): Map<string, AbilityLogic> {
		return this.boundAbilities.get(slot) ?? new Map();
	}
}
