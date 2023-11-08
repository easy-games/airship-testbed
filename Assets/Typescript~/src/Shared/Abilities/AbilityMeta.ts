import { Ability } from "@Easy/Core/Shared/Strollers/Abilities/AbilityRegistry";
import RecallAbility from "./RecallAbility";
import { AbilitySlot } from "@Easy/Core/Shared/Abilities/AbilitySlot";
import { Duration } from "@Easy/Core/Shared/Util/Duration";
import { AbilityCancellationTrigger } from "@Easy/Core/Shared/Abilities/Ability";

export const Abilities: Record<AbilityId, Ability> = {
	[AbilityId.RECALL]: {
		logic: RecallAbility,
		config: {
			slot: AbilitySlot.Utility,
			name: "Recall",
			charge: {
				chargeTimeSeconds: 10,
				cancelTriggers: [
					AbilityCancellationTrigger.EntityDamageTaken,
					AbilityCancellationTrigger.EntityMovement,
				],
			},
			cooldownTimeSeconds: 0.5,
		},
	},
};
