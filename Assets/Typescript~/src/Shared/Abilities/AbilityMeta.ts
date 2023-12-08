import { AbilityCancellationTrigger, AbilityKind } from "@Easy/Core/Shared/Abilities/Ability";
import { AbilitySlot } from "@Easy/Core/Shared/Abilities/AbilitySlot";
import { Ability } from "@Easy/Core/Shared/Strollers/Abilities/AbilityRegistry";
import { AbilityId } from "./AbilityType";

export const Abilities: Record<AbilityId, Ability> = {
	[AbilityId.RECALL]: {
		id: AbilityId.RECALL,
		config: {
			slot: AbilitySlot.Utility,
			kind: AbilityKind.Active,
			name: "Recall",
			image: "Shared/Resources/Images/HomeIcon.png",
			charge: {
				chargeTimeSeconds: 4,
				cancelTriggers: [
					AbilityCancellationTrigger.EntityDamageTaken,
					AbilityCancellationTrigger.EntityMovement,
					AbilityCancellationTrigger.EntityFiredProjectile,
				],
				displayText: "Teleporting back to base",
			},
			cooldownTimeSeconds: 3,
		},
	},
};
