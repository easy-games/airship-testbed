import { gameModerationClient } from "@Easy/Core/Client/ProtectedControllers/Airship/Moderation/GameModerationClient";
import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { GameModerationCommand } from "@Easy/Core/Client/ProtectedControllers/Airship/Moderation/Commands/GameModCommandHelper";

export class GameModNoteCommand extends ChatCommand {
	constructor() {
		super(GameModerationCommand.NOTE, [], "/note <username> <note>", "Adds a note to a player's moderation profile.", true);
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() < 2) {
			player.SendMessage(ChatColor.Red(`Invalid usage: /note <username> <note>`));
			return;
		}

		const targetUsername = args[0];
		const note = args[1];

		const target = Airship.Players.FindByFuzzySearch(targetUsername);
		if (!target) {
			player.SendMessage(ChatColor.Red(`Player not found: ${targetUsername}`));
			return;
		}

		task.spawn(async () => {
			try {
				const created = await gameModerationClient.gameModeration.addNote({
					uid: target.userId,
					gameId: Game.gameId,
					note,
				});
				player.SendMessage(`Added note to ${target.username}: ${created.reason}`);
			} catch {
				player.SendMessage(ChatColor.Red(`Failed to add note to ${target.username}.`));
			}
		});
	}
}
