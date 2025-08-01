import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";

export class HealCommand extends ChatCommand {
	constructor() {
		super("heal");
		this.requiresPermission = true;
	}

	public Execute(player: Player, args: string[]): void {
		if (!player.character) return;
		const character = Airship.Characters.FindByplayerConnectionId(player.connectionId);
		if (!character) return;
		Airship.Damage.Heal(character.gameObject, character.GetMaxHealth());
		Game.BroadcastMessage(ColorUtil.ColoredText(Theme.green, player.username + " used /heal"));
	}
}
