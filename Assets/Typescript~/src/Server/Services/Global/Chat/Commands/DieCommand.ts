import { Dependency } from "@easy-games/flamework-core";
import { ChatCommand } from "Imports/Core/Shared/Commands/ChatCommand";
import { DamageService } from "Server/Services/Global/Damage/DamageService";
import { EntityService } from "Server/Services/Global/Entity/EntityService";
import { Player } from "Shared/Player/Player";

export class DieCommand extends ChatCommand {
	constructor() {
		super("die");
	}

	public Execute(player: Player, args: string[]): void {
		/* Fetch target entity. */
		const target = Dependency<EntityService>().GetEntityByClientId(player.clientId);

		/* Handle invalid entity. */
		if (target === undefined) {
			player.SendMessage("invalid target");
			return;
		}

		/* Kill entity. */
		Dependency<DamageService>().InflictDamage(target, math.huge, {
			ignoreCancelled: true,
		});
	}
}
