import { gameModerationClient } from "@Easy/Core/Client/ProtectedControllers/Airship/Moderation/GameModerationClient";
import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ModerationServiceDatabaseTypes } from "@Easy/Core/Shared/TypePackages/moderation-service-types";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { GameModerationCommand, ValidateModerationActionDurationFormat } from "@Easy/Core/Client/ProtectedControllers/Airship/Moderation/Commands/GameModCommandHelper";

export class GameModTempBanCommand extends ChatCommand {
	constructor() {
		super(GameModerationCommand.TEMPBAN, [], "/tempban <username> <duration> <reason?>", "Temporarily bans a player.", true);
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() < 2) {
			player.SendMessage(ChatColor.Red(`Invalid usage: /tempban <username> <duration> <reason?>`));
			return;
		}

		const targetUsername = args[0];
		const duration = args[1];
		const reason = args[2];

		if (!ValidateModerationActionDurationFormat(duration)) {
			player.SendMessage(ChatColor.Red(`Invalid usage: Duration must be in the format of '#s' '#m' '#h' or '#d'`));
			return;
		}

		const target = Airship.Players.FindByFuzzySearch(targetUsername);
		if (!target) {
			player.SendMessage(ChatColor.Red(`Player not found: ${targetUsername}`));
			return;
		}

		task.spawn(async () => {
			try {
				const action = await gameModerationClient.gameModeration.postAction({
					actionType: ModerationServiceDatabaseTypes.GameModerationActionType.BAN,
					uid: target.userId,
					gameId: Game.gameId,
					reason,
					duration,
				});
				player.SendMessage(`Temporarily banned ${target.username} for ${duration} for reason: ${action.reason}`);
			} catch {
				player.SendMessage(ChatColor.Red(`Failed to temporarily ban ${target.username}.`));
			}
		});
	}
}
