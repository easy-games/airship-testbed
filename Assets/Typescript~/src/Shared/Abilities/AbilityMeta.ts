import { Ability } from "@Easy/Core/Shared/Strollers/Abilities/AbilityRegistry";
import RecallAbility from "./Logic/RecallAbility";
import { AbilitySlot } from "@Easy/Core/Shared/Abilities/AbilitySlot";
import { AbilityCancellationTrigger } from "@Easy/Core/Shared/Abilities/Ability";
import VorliasTestAbility from "./Logic/VorliasTestAbility";
import { AbilityId } from "./AbilityType";

export const Abilities: Record<AbilityId, Ability> = {
	[AbilityId.RECALL]: {
		id: AbilityId.RECALL,
		logic: RecallAbility,
		config: {
			slot: AbilitySlot.Utility,
			name: "Recall",
			image: "Shared/Resources/Images/HomeIcon.png",
			charge: {
				chargeTimeSeconds: 6,
				cancelTriggers: [
					AbilityCancellationTrigger.EntityDamageTaken,
					AbilityCancellationTrigger.EntityMovement,
				],
				displayText: "Teleporting back to base",
			},
			cooldownTimeSeconds: 0.5,
		},
	},
	[AbilityId.VORLIAS_TEST]: {
		id: AbilityId.VORLIAS_TEST,
		logic: VorliasTestAbility,
		config: {
			slot: AbilitySlot.Primary,
			name: "vorlias",
			cooldownTimeSeconds: 5,
		},
	},
};
