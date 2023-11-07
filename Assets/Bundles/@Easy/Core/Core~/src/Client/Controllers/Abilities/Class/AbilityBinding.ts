import { AbilityDto } from "Shared/Abilities/Ability";
import { AbilitySlot } from "Shared/Abilities/AbilitySlot";

export class AbilityBinding {
	private ability: AbilityDto | undefined;

	public constructor(private slot: AbilitySlot) {}
	/**
	 * Attempts to bind the ability at this slot
	 * @param ability
	 * @param priority
	 */
	public Bind(ability: AbilityDto, priority?: number) {}

	public GetBound() {
		return this.ability;
	}
}
