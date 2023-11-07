import { Ability } from "@Easy/Core/Shared/Strollers/Abilities/AbilityRegistry";
import RecallAbility from "./RecallAbility";
import { AbilitySlot } from "@Easy/Core/Shared/Abilities/AbilitySlot";

export const Abilities: Record<AbilityId, Ability> = {
	[AbilityId.RECALL]: {
		logic: RecallAbility,
		config: {
			slot: AbilitySlot.Utility1,
			name: "Recall",
			charge: {
				chargeDurationSeconds: 10,
			},
		},
	},
};
