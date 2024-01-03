import { Dependency } from "@easy-games/flamework-core";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Task } from "@Easy/Core/Shared/Util/Task";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
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
			Game.BroadcastMessage(`${ColorUtil.ColoredText(Theme.aqua, player.username)} started the match!`);
		});
	}
}
