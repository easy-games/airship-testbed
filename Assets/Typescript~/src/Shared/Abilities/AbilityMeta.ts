import { AbilityCancellationTrigger, AbilityKind } from "@Easy/Core/Shared/Abilities/Ability";
import { AbilitySlot } from "@Easy/Core/Shared/Abilities/AbilitySlot";
import { Ability } from "@Easy/Core/Shared/Strollers/Abilities/AbilityRegistry";
import { AbilityId } from "./AbilityType";
import RobbieTestAbility from "./Logic/Kit/RobbieTestAbility";
import RecallAbility from "./Logic/RecallAbility";
import VorliasTestAbility from "./Logic/VorliasTestAbility";

export const Abilities: Record<AbilityId, Ability> = {
	[AbilityId.RECALL]: {
		id: AbilityId.RECALL,
		logic: RecallAbility,
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
	[AbilityId.VORLIAS_TEST]: {
		id: AbilityId.VORLIAS_TEST,
		logic: VorliasTestAbility,
		config: {
			kind: AbilityKind.Active,
			slot: AbilitySlot.Primary,
			name: "vorlias",
			cooldownTimeSeconds: 5,
		},
	},
	[AbilityId.ROBBIE_TEST]: {
		id: AbilityId.ROBBIE_TEST,
		logic: RobbieTestAbility,
		config: {
			kind: AbilityKind.Passive,
			name: "robbie",
		},
	},
};
