import { Controller, Service } from "@easy-games/flamework-core";
import { AbilityConfig } from "Shared/Abilities/Ability";

export interface Ability {
	/**
	 * The given id for this ability
	 */
	readonly id: string;
	/**
	 * Configuration around the ability
	 */
	readonly config: AbilityConfig;
}

@Service()
@Controller()
export class AbilityRegistry {
	private abilityHandlers = new Map<string, Ability>();

	/**
	 * Registers the given ability to the ability registry by id.
	 *
	 * @param id The id of the ability to register.
	 * @param config The configuration for the ability.
	 * @returns The registered ability.
	 */
	public RegisterAbilityById(id: string, config: AbilityConfig): Ability {
		if (this.abilityHandlers.has(id)) {
			error(`Attempted to add duplicate ability to registry: ${id}`);
		}
		const metadata = identity<Ability>({ id, config });
		this.abilityHandlers.set(id, metadata);
		return metadata;
	}

	/**
	 * Gets the ability from the registry by the given id.
	 *
	 * @param id The id of the ability to get.
	 * @returns The ability if it exists.
	 */
	public GetAbilityById(id: string): Ability | undefined {
		return this.abilityHandlers.get(id);
	}

	/**
	 * Returns a map of all the abilities registered in this registry.
	 */
	public GetAllRegisteredAbilities(): ReadonlyMap<string, Ability> {
		return this.abilityHandlers;
	}
}
