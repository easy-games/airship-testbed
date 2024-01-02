import { Dependency } from "@easy-games/flamework-core";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Theme } from "Shared/Util/Theme";
import { PlayerService } from "../../Player/PlayerService";

export class TpAllCommand extends ChatCommand {
	constructor() {
		super("tpAll");
	}

	public Execute(player: Player, args: string[]): void {
		const pos = player.Character?.GameObject.transform.position;
		if (!pos) return;

		for (const p of Dependency<PlayerService>().GetPlayers()) {
			if (p !== player) {
				if (p.Character) {
					p.SendMessage(
						ColorUtil.ColoredText(Theme.Aqua, player.username) +
							ColorUtil.ColoredText(Theme.Gray, " teleported you."),
					);
					p.Character.Teleport(pos, player.Character?.EntityDriver.GetLookVector());
				}
			}
		}
	}
}
