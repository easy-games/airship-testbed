import { Airship } from "Shared/Airship";
import Character from "Shared/Character/Character";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";

export class DamageCommand extends ChatCommand {
	constructor() {
		super("damage", [], "[amount]");
	}

	public Execute(player: Player, args: string[]): void {
		let amount: number | undefined;
		let target: Character | undefined;

		if (args.size() === 1) {
			amount = tonumber(args[0]);
			target = Airship.characters.FindByClientId(player.clientId);
		}

		if (amount === undefined) {
			player.SendMessage("invalid amount: " + amount);
			return;
		}

		if (target === undefined) {
			player.SendMessage("invalid target");
			return;
		}
		Airship.damage.InflictDamage(target.gameObject, amount);
		player.SendMessage(`Inflicted ${amount} damage to ${target.id}`);
	}
}
