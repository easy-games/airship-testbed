import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";

export class TpAllCommand extends ChatCommand {
	constructor() {
		super("tpAll");
	}

	public Execute(player: Player, args: string[]): void {
		const pos = player.character?.gameObject.transform.position;
		if (!pos) return;

		for (const p of Airship.players.GetPlayers()) {
			if (p !== player) {
				if (p.character) {
					p.SendMessage(
						ColorUtil.ColoredText(Theme.aqua, player.username) +
							ColorUtil.ColoredText(Theme.gray, " teleported you."),
					);
					p.character.Teleport(pos, Quaternion.LookRotation(player.character!.movement.GetLookVector()));
				}
			}
		}
	}
}
