import { Dependency } from "@easy-games/flamework-core";
import { DamageService } from "Server/Services/Damage/DamageService";
import { EntityService } from "Server/Services/Entity/EntityService";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Entity } from "Shared/Entity/Entity";
import { Player } from "Shared/Player/Player";

export class DamageCommand extends ChatCommand {
	constructor() {
		super("damage");
	}

	public Execute(player: Player, args: string[]): void {
		let amount: number | undefined;
		let target: Entity | undefined;

		if (args.size() === 1) {
			amount = tonumber(args[0]);
			target = Dependency<EntityService>().GetEntityByClientId(player.clientId);
		}

		if (amount === undefined) {
			player.SendMessage("invalid amount: " + amount);
			return;
		}

		if (target === undefined) {
			player.SendMessage("invalid target");
			return;
		}

		Dependency<DamageService>().InflictDamage(target, amount, {
			ignoreCancelled: true,
		});
		player.SendMessage(`Inflicted ${amount} dmg to ${target.id}`);
	}
}
