import { Ability } from "Shared/Strollers/Abilities/AbilityRegistry";
import { AbilityLogic } from "./AbilityLogic";
import { AbilitySlot } from "./AbilitySlot";
import { MapUtil } from "Shared/Util/MapUtil";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { CoreNetwork } from "Shared/CoreNetwork";
import { AbilityConfig, AbilityDto } from "./Ability";
import { Duration } from "Shared/Util/Duration";

export interface AbilityCooldown {
	readonly Length: Duration;
	readonly StartedTimestamp: number;
}

export class CharacterAbilities {
	private cooldowns = new Map<Ability, AbilityCooldown>();
	private boundAbilities = new Map<AbilitySlot, Map<string, AbilityLogic>>();

	private currentlyCasting: Promise<void> | undefined; // using promise rn because need cancellation

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

		const logic = new ability.logic(this.entity, abilityId, overrideConfig ?? ability.config);
		abilityMap.set(abilityId, logic);

		if (this.entity.ClientId) {
			CoreNetwork.ServerToClient.AbilityAdded.Server.FireClient(this.entity.ClientId, logic.ToDto());
		}
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

	public async UseAbilityById(id: string) {
		if (RunCore.IsServer()) {
			const ability = this.GetAbilityById(id);
			if (ability) {
				const config = ability.GetConfiguration();
				if (config.charge) {
					ability.OnChargeBegan();
					return Promise.delay(config.charge.chargeDurationSeconds).then(() => {
						ability.OnTriggered();
					});
				} else {
					ability.OnTriggered();
					return Promise.resolve();
				}
			}
		} else {
			// CoreNetwork.ClientToServer.UseAbility.Client.FireServer({
			// 	abilityId: id,
			// });
			// return
			throw `UseAbilityById can only be used by the server!`;
		}
	}

	/**
	 * Gets all abilities as an array of data transfer objects
	 * @returns The array of data transfer objects
	 */
	public ToArrayDto() {
		const items = new Array<AbilityDto>();
		for (const [slot, abilityMap] of this.boundAbilities) {
			for (const [abilityId, abilityLogic] of abilityMap) {
				items.push(abilityLogic.ToDto());
			}
		}
		return items;
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
