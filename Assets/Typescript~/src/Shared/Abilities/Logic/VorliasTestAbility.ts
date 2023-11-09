import { DamageService } from "@Easy/Core/Server/Services/Damage/DamageService";
import { AbilityLogic } from "@Easy/Core/Shared/Abilities/AbilityLogic";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { Dependency } from "@easy-games/flamework-core";

export default class VorliasTestAbility extends AbilityLogic {
	public override OnEnabled(): void {
		print("Recall ability enabled for", this.entity.GetDisplayName());
	}

	public override OnDisabled(): void {
		print("Recall ability disabled for", this.entity.GetDisplayName());
	}

	public override OnTriggered(): void {
		const player = this.entity.player;
		if (player) {
			// Simple tp to spawn :-)

			Dependency<DamageService>().InflictDamage(this.entity, 50);
			// for (let i = 1; i < 360 / 4; i++) {
			// 	this.entity.LaunchProjectile(
			// 		undefined,
			// 		ItemType.WOOD_ARROW,
			// 		this.entity.GetPosition(),
			// 		this.entity.entityDriver.GetLookVector().mul(Quaternion.Euler(0, i, 0).eulerAngles),
			// 	);
			// }
		}
	}
}
