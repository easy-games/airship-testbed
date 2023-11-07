import { Ability, AbilityConfig } from "Shared/Strollers/Abilities/AbilityRegistry";
import { AbilityLogic } from "./AbilityLogic";
import { AbilitySlot } from "./AbilitySlot";
import { MapUtil } from "Shared/Util/MapUtil";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";

export class CharacterAbilities {
	private boundAbilities = new Map<AbilitySlot, Map<string, AbilityLogic>>();

	public constructor(private entity: CharacterEntity) {}

	private GetAbilities() {
		const arr = new Array<[string, AbilityLogic]>();
		for (const [slot, boundItems] of this.boundAbilities) {
			for (const pair of boundItems) {
				arr.push(pair);
			}
		}

		return arr;
	}

	/**
	 * Adds the given ability to the character
	 * @param abilityId The ability's unique id
	 * @param slot The slot the ability is bound to
	 * @param logic The logic of the ability
	 */
	public AddAbilityWithId(
		abilityId: string,
		slot: AbilitySlot,
		ability: Ability,
		overrideConfig?: AbilityConfig,
	): AbilityLogic {
		assert(RunCore.IsServer(), "AddAbilityWithId should be called by the server");

		const abilityMap = MapUtil.GetOrCreate(this.boundAbilities, slot, () => new Map<string, AbilityLogic>());

		const logic = new ability.factory(this.entity, abilityId, overrideConfig ?? ability.config);
		abilityMap.set(abilityId, logic);

		return logic;
	}

	/**
	 * Gets the ability by the given id
	 * @param id The id of the ability
	 * @returns The ability logic
	 */
	public GetAbilityById(id: string) {
		return this.GetAbilities().find((f) => f[0] === id)?.[1];
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
