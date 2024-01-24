import { Airship } from "Shared/Airship";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";

export class DieCommand extends ChatCommand {
	constructor() {
		super("die");
	}

	public Execute(player: Player, args: string[]): void {
		// Fetch target entity.
		const target = Airship.characters.FindByPlayer(player);

		// Handle invalid entity.
		if (target === undefined) {
			player.SendMessage("invalid target");
			return;
		}

		// Kill entity.
		Airship.damage.InflictDamage(target.gameObject, math.huge);
	}
}
