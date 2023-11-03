import { AbilityLogic } from "@Easy/Core/Shared/Abilities/AbilityLogic";

export default class RecallAbility extends AbilityLogic {
	public override OnEnabled(): void {
		print("Recall ability enabled for", this.entity.GetDisplayName());
	}

	public override OnDisabled(): void {
		print("Recall ability disabled for", this.entity.GetDisplayName());
	}
}
