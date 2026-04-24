import { gameModerationClient } from "@Easy/Core/Client/ProtectedControllers/Airship/Moderation/GameModerationClient";
import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { GameModerationCommand, GetModerationActionDuration } from "@Easy/Core/Client/ProtectedControllers/Airship/Moderation/Commands/GameModCommandHelper";

export class GameModLookupCommand extends ChatCommand {
	constructor() {
		super(GameModerationCommand.LOOKUP, [], "/modlookup <username>", "Fetches a player's moderation profile.", true);
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() === 0) {
			player.SendMessage(ChatColor.Red(`Invalid usage: /modlookup <username>`));
			return;
		}

		const targetUsername = args[0];
		const target = Airship.Players.FindByFuzzySearch(targetUsername);
		if (!target) {
			player.SendMessage(ChatColor.Red(`Player not found: ${targetUsername}`));
			return;
		}

		task.spawn(async () => {
			try {
				const profile = await gameModerationClient.gameModeration.getUserModerationProfile({
					uid: target.userId,
					gameId: Game.gameId,
				});

				const { activeMute, activeBan, actions, notes } = profile;

				const muteDisplay = activeMute
					? `Expires at ${activeMute.expiresAt ?? "never"}. Reason: ${activeMute.reason}.`
					: "None";

				const banDisplay = activeBan
					? `Expires at ${activeBan.expiresAt ?? "never"}. Reason: ${activeBan.reason}.`
					: "None";

				const actionsDisplay = actions && actions.size() > 0
					? actions.map((a) => `\n    Type: ${a.actionType}. Reason: ${a.reason}. Duration: ${GetModerationActionDuration(a.createdAt, a.expiresAt)}. Id: ${a.id}`).join("")
					: "None";

				const notesDisplay = notes && notes.size() > 0
					? notes.map((n) => `\n    Note: ${n.reason}. Id: ${n.id}`).join("")
					: "None";

				player.SendMessage(`------------------------------------------`);
				player.SendMessage(`Moderation profile for ${target.username}:`);
				player.SendMessage(`  Active Mute: ${muteDisplay}`);
				player.SendMessage(`  Active Ban: ${banDisplay}`);
				player.SendMessage(`  Past Actions: ${actionsDisplay}`);
				player.SendMessage(`  Notes: ${notesDisplay}`);
				player.SendMessage(`------------------------------------------`);
			} catch {
				player.SendMessage(ChatColor.Red(`Failed to fetch moderation profile for ${targetUsername}.`));
			}
		});
	}
}
