import { Controller, OnStart, Service } from "@easy-games/flamework-core";
import { AbilityConfig, AbilityLogicConstructor } from "Shared/Abilities/Ability";
import { AbilityLogic } from "Shared/Abilities/AbilityLogic";

export interface Ability {
	/**
	 * The given id for this ability
	 */
	readonly id: string;
	/**
	 * The logic class for the ability
	 */
	readonly logic: AbilityLogicConstructor;
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
	 * Registers the given ability to the ability registry by id
	 * @param id The id of the ability to register
	 * @param abilityLogicClass The logic for the ability
	 * @param config The configuration for the ability
	 * @returns The registered ability
	 */
	public RegisterAbilityById<T extends AbilityLogic>(
		id: string,
		abilityLogicClass: AbilityLogicConstructor<T>,
		config: AbilityConfig,
	): Ability {
		if (this.abilityHandlers.has(id)) {
			error(`Attempted to add duplicate ability to registry: ${id}`);
		}

		const metadata = identity<Ability>({
			id,
			logic: abilityLogicClass,
			config,
		});

		this.abilityHandlers.set(id, metadata);
		return metadata;
	}

	/**
	 * Gets the ability from the registry by the given id
	 * @param id The id of the ability to get
	 * @returns The ability (if it exists) - or undefined
	 */
	public GetAbilityById(id: string): Ability | undefined {
		return this.abilityHandlers.get(id);
	}

	/**
	 * Returns a map of all the abilities registered in this registry
	 */
	public GetAllRegisteredAbilities(): ReadonlyMap<string, Ability> {
		return this.abilityHandlers;
	}
}
