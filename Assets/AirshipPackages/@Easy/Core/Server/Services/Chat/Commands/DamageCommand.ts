import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";

export class DamageCommand extends ChatCommand {
	constructor() {
		super("damage", [], "[amount]");
	}

	public Execute(player: Player, args: string[]): void {
		let amount: number | undefined;
		let target: Character | undefined;

		if (args.size() === 1) {
			amount = tonumber(args[0]);
			target = Airship.Characters.FindByClientId(player.connectionId);
		}

		if (amount === undefined) {
			player.SendMessage("invalid amount: " + amount);
			return;
		}

		if (target === undefined) {
			player.SendMessage("invalid target");
			return;
		}
		Airship.Damage.InflictDamage(target.gameObject, amount);
		print(`Inflicted ${amount} damage to ${target.id}`);
		player.SendMessage(`Inflicted ${amount} damage to ${target.id}`);
	}
}
