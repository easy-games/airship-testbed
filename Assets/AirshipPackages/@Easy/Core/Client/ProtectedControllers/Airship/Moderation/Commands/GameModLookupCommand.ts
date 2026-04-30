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

				const totalActions = actions?.size() ?? 0;

				const kickCount = actions?.filter((a) => a.actionType === "KICK").size() ?? 0;
				const muteCount = actions?.filter((a) => a.actionType === "MUTE").size() ?? 0;
				const banCount = actions?.filter((a) => a.actionType === "BAN").size() ?? 0;

				const actionsSummary = totalActions > 0
					? `${totalActions} total (${kickCount} kick${kickCount !== 1 ? "s" : ""}, ${muteCount} mute${muteCount !== 1 ? "s" : ""}, ${banCount} ban${banCount !== 1 ? "s" : ""})`
					: "None";

				const startIndex = math.max(0, totalActions - 3);
				let actionsDisplay = "None";
				if (actions && totalActions > 0) {
					let parts = "";
					for (let i = startIndex; i < totalActions; i++) {
						const a = actions[i];
						parts += `\n  Id: ${a.id}\n  Type: ${a.actionType}\n  Reason: ${a.reason}\n  Duration: ${GetModerationActionDuration(a.createdAt, a.expiresAt)}`;
					}
					actionsDisplay = parts;
				}

				const notesDisplay = notes && notes.size() > 0
					? notes.map((n) => `\n  Id: ${n.id}\n  Note: ${n.reason}`).join("")
					: "None";

				player.SendMessage(ChatColor.White(ChatColor.Bold(`-----------------------------------`)));
				player.SendMessage(ChatColor.White(ChatColor.Bold(`Moderation profile for ${target.username}:`)));
				player.SendMessage(ChatColor.Yellow(`Active Mute: ${muteDisplay}`));
				player.SendMessage(ChatColor.Red(`Active Ban: ${banDisplay}`));
				player.SendMessage(ChatColor.White(`Past Actions (${actionsSummary}): ${actionsDisplay}`));
				player.SendMessage(ChatColor.Blue(`Notes: ${notesDisplay}`));
				player.SendMessage(ChatColor.Aqua(`Full results: https://create.airship.gg/dashboard/organization/game/moderation-profile-lookup`));
				player.SendMessage(ChatColor.White(ChatColor.Bold(`-----------------------------------`)));
			} catch {
				player.SendMessage(ChatColor.Red(`Failed to fetch moderation profile for ${targetUsername}.`));
			}
		});
	}
}
