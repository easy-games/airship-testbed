import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";

export class KillCommand extends ChatCommand {
	constructor() {
		super("kill", ["die"]);
	}

	public Execute(player: Player, args: string[]): void {
		let target: Character | undefined;
		if (args.size() > 0) {
			let otherPlayer = Airship.Players.FindByFuzzySearch(args[0]);
			if (!otherPlayer) {
				player.SendMessage("Invalid player: " + args[0]);
				return;
			}
			if (otherPlayer.character === undefined) {
				player.SendMessage("Player " + otherPlayer.username + " does not have a character.");
				return;
			}
			target = otherPlayer.character;
		} else {
			target = Airship.Characters.FindByPlayer(player);
		}

		// Handle invalid entity.
		if (target === undefined) {
			player.SendMessage("invalid target");
			return;
		}

		// Kill entity.
		Airship.Damage.InflictDamage(target.gameObject, math.huge);
	}
}
