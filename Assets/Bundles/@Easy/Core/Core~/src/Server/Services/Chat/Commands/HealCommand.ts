import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Entity } from "Shared/Entity/Entity";
import { Game } from "Shared/Game";
import { Player } from "Shared/Player/Player";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Theme } from "Shared/Util/Theme";

export class HealCommand extends ChatCommand {
	constructor() {
		super("heal");
	}

	public Execute(player: Player, args: string[]): void {
		const entity = Entity.FindByClientId(player.clientId);
		entity?.SetHealth(entity.GetMaxHealth());
		Game.BroadcastMessage(ColorUtil.ColoredText(Theme.green, player.username + " used /heal"));
	}
}
