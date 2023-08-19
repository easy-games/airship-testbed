import { Dependency } from "@easy-games/flamework-core";
import { ChatCommand } from "Imports/Core/Shared/Commands/ChatCommand";
import { Game } from "Imports/Core/Shared/Game";
import { Player } from "Imports/Core/Shared/Player/Player";
import { ColorUtil } from "Imports/Core/Shared/Util/ColorUtil";
import { Task } from "Imports/Core/Shared/Util/Task";
import { Theme } from "Imports/Core/Shared/Util/Theme";
import { MatchService } from "Server/Services/Match/MatchService";

export class MatchStartCommand extends ChatCommand {
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
