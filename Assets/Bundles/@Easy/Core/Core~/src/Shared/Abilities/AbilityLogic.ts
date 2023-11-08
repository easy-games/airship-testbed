import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { AbilityConfig, AbilityDto } from "./Ability";
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

	public GetId() {
		return this.id;
	}

	public GetConfiguration(): AbilityConfig {
		return this.configuration;
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

	/**
	 * Invoked when the ability is triggered
	 *
	 * - This may be after a charge duration
	 * 		if the charge duration is set and the ability charge wasn't cancelled
	 */
	public abstract OnTriggered(): void;

	public OnChargeBegan(): void {}

	public OnChargeCancelled(): void {}

	/**
	 * Cast this ability logic to a data transfer object representation
	 * @returns The data transfer object representation of this ability logic
	 */
	public ToDto(): AbilityDto {
		return {
			id: this.GetId(),
			enabled: this.GetEnabled(),
			slot: this.GetConfiguration().slot,
			charging: this.GetConfiguration().charge,
		};
	}
}
