import { Dependency, Modding } from "@easy-games/flamework-core";
import { AbilitiesController } from "Client/Controllers/Abilities/AbilitiesController";
import { AbilitiesService } from "Server/Services/Abilities/AbilitiesService";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";
import { AbilityConfig } from "Shared/Strollers/Abilities/AbilityRegistry";
/**
 * A logic class surrounding an ability
 */
export abstract class AbilityLogic {
	private enabled = false;

	public constructor(
		protected readonly entity: CharacterEntity,
		protected readonly id: string,
		protected readonly configuration: AbilityConfig,
	) {}

	/**
	 * Lifecycle for this being initialized on the server
	 * @internal
	 */
	public OnServerInit() {
		const abilityService = Dependency<AbilitiesService>();
	}

	/**
	 * Lifecycle for this being initialized on the client
	 * @internal
	 */
	public OnClientInit() {
		const abilityController = Dependency<AbilitiesController>();
		// TODO: Contact the ability controller to handle the UI situation?
	}

	/**
	 * Set whether or not this ability is enabled
	 * @param enabled Whether or not this ability is enabled
	 */
	public SetEnabled(enabled: boolean) {
		this.enabled = enabled;

		// Handle side-effects of enabling/disabling this ability
		if (enabled) {
			this.OnEnabled();
		} else {
			this.OnDisabled();
		}
	}

	/**
	 * Get the enabled state of this ability
	 */
	public GetEnabled() {
		return this.enabled;
	}

	/**
	 * Lifecycle function for when this is enabled
	 */
	public OnEnabled() {}

	/**
	 * Lifecycle function for when this is enabled
	 */
	public OnDisabled() {}
}
