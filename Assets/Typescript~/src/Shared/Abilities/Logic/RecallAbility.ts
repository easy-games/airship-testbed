import { TeamService } from "@Easy/Core/Server/Services/Team/TeamService";
import { ClientAbilityChargeEvent } from "@Easy/Core/Shared/Abilities/AbilityLogic";
import { AbilityLogic } from "@Easy/Core/Shared/Abilities/AbilityLogic";
import { Dependency } from "@easy-games/flamework-core";
import { BWSpawnService } from "Server/Services/Match/BW/BWSpawnService";

export default class RecallAbility extends AbilityLogic {
	public override OnEnabled(): void {
		print("Recall ability enabled for", this.entity.GetDisplayName());
	}

	public override OnDisabled(): void {
		print("Recall ability disabled for", this.entity.GetDisplayName());
	}

	override OnClientChargeBegan(): void {
		// TODO: Effect goes here
		print("TODO: Spawn effect pls");
	}

	override OnClientChargeEnded(event: ClientAbilityChargeEvent): void {
		// TODO: Effect removal goes here
		print("TODO: Despawn effect pls");
	}

	public override OnServerTriggered(): void {
		const player = this.entity.player;
		if (player) {
			// Simple tp to spawn :-)
			Dependency<BWSpawnService>().TeleportPlayerToSpawn(player);
		}
	}
}
