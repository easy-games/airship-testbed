import { gameModerationClient } from "@Easy/Core/Client/ProtectedControllers/Airship/Moderation/GameModerationClient";
import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ModerationServiceDatabaseTypes } from "@Easy/Core/Shared/TypePackages/moderation-service-types";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { GameModerationCommand } from "@Easy/Core/Client/ProtectedControllers/Airship/Moderation/Commands/GameModCommandHelper";

export class GameModUnbanCommand extends ChatCommand {
	constructor() {
		super(GameModerationCommand.UNBAN, [], "/unban <username> <reason?>", "Unbans a player.", true);
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() === 0) {
			player.SendMessage(ChatColor.Red(`Invalid usage: /unban <username> <reason?>`));
			return;
		}

		const targetUsername = args[0];
		const reason = args[1];

		const target = Airship.Players.FindByFuzzySearch(targetUsername);
		if (!target) {
			player.SendMessage(ChatColor.Red(`Player not found: ${targetUsername}`));
			return;
		}

		task.spawn(async () => {
			try {
				const action = await gameModerationClient.gameModeration.deleteAction({
					actionType: ModerationServiceDatabaseTypes.GameModerationActionType.BAN,
					uid: target.userId,
					gameId: Game.gameId,
					reason,
				});
				player.SendMessage(`Unbanned ${target.username}. Reason: ${action.reason}`);
			} catch {
				player.SendMessage(ChatColor.Red(`Failed to unban ${target.username}.`));
			}
		});
	}
}
