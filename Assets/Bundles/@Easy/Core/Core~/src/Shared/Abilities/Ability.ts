import { AbilityConfig, AbilityId } from "Shared/Strollers/Abilities/AbilityRegistry";

export interface SingleUseAbility {}

/**
 * An ability
 */
export abstract class Ability {
	private enabled = false;

	public constructor(protected readonly id: AbilityId, protected readonly configuration: AbilityConfig) {}

	/**
	 * Set whether or not this ability is enabled
	 * @param enabled Whether or not this ability is enabled
	 */
	public SetEnabled(enabled: boolean) {
		this.enabled = enabled;
	}

	/**
	 * Get the enabled state of this ability
	 */
	public GetEnabled() {
		return this.enabled;
	}

	/**
	 * Lifecycle function for when the ability is enabled
	 */
	public OnEnabled(): void {}

	/**
	 * Lifecycle function for when the ability is disabled
	 */
	public OnDisabled(): void {}

	/**
	 * Event for when this ability is pressed
	 */
	public OnActionPressed(): void {}

	/**
	 * Event for when this ability is released
	 */
	public OnActionReleased(): void {}
}
