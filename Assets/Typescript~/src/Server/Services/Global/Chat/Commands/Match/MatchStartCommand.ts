import { Dependency } from "@easy-games/flamework-core";
import { MatchService } from "Server/Services/Match/MatchService";
import { Game } from "Shared/Game";
import { Player } from "Shared/Player/Player";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Task } from "Shared/Util/Task";
import { Theme } from "Shared/Util/Theme";
import { ChatCommand } from "../../../../../Commands/ChatCommand";

export class StartMatchCommand extends ChatCommand {
	constructor() {
		super("start");
	}

	public Execute(player: Player, args: string[]): void {
		/* Start match when match is ready. */
		Task.Spawn(() => {
			Dependency<MatchService>().WaitForMatchReady();
			Dependency<MatchService>().StartMatch();
			Game.BroadcastMessage(`${ColorUtil.ColoredText(Theme.Aqua, player.username)} started the match!`);
		});
	}
}
