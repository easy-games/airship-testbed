import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Game } from "@Easy/Core/Shared/Game";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";

export class HealCommand extends ChatCommand {
	constructor() {
		super("heal");
	}

	public Execute(player: Player, args: string[]): void {
		if (!player.character) return;
		const character = Airship.characters.FindByClientId(player.clientId);
		character?.SetHealth(character.GetMaxHealth());
		CoreNetwork.ServerToClient.Character.SetHealth.server.FireAllClients(
			player.character.id,
			player.character.GetMaxHealth(),
		);
		Game.BroadcastMessage(ColorUtil.ColoredText(Theme.green, player.username + " used /heal"));
	}
}
