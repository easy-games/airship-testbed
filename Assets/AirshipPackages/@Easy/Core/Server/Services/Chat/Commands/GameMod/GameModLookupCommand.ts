import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { ModerationServiceBridgeTopics, ServerBridgeApiGameModUserLookup } from "@Easy/Core/Server/ProtectedServices/Airship/Moderation/ModerationService";
import { GameModerationCommand, GetModerationActionDuration } from "./GameModCommandHelper";

export class GameModLookupCommand extends ChatCommand {
    constructor() {
        super(GameModerationCommand.LOOKUP, [], "/modlookup <username>", "Fetches a user's moderation history.", true);
        this.requiresPermission = true; // Granted by having moderation role and user lookup permission for current game
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
        
        const profile = contextbridge.invoke<ServerBridgeApiGameModUserLookup>(
            ModerationServiceBridgeTopics.GameModerationUserLookup,
            LuauContext.Protected,
            {
                uid: target.userId,
                gameId: Game.gameId,
            }
        );
        if (!profile) {
            player.SendMessage(ChatColor.Red(`Moderation history not found for: ${targetUsername}`));
            return;
        }

        const { activeMute, activeBan, actions, notes } = profile;

        let muteDisplay = "None";
        if (activeMute) {
            muteDisplay = `Expires at ${activeMute.expiresAt}. Reason: ${activeMute.reason}.`
        }

        let banDisplay = "None";
        if (activeBan) {
            banDisplay = `Expires at ${activeBan.expiresAt}. Reason: ${activeBan.reason}.`
        }

        let actionsDisplay = "None";
        if (actions) {
            actionsDisplay = `  Past actions: ${actions.map((a) => {
                return `\n    Type: ${a.actionType}. Reason: ${a.reason}. Duration: ${GetModerationActionDuration(a.createdAt, a.expiresAt)}. Id: ${a.id}`
            })}`
        }

        let notesDisplay = "None"
        if (notes) {
            notesDisplay = `  Notes: ${notes.map((n) => {
                return `\n    Note: ${n.reason}. Id: ${n.id}`
            })}`
        }

        player.SendMessage(`------------------------------------------`);
        player.SendMessage(`Moderation profile for ${target.username}:`);
        player.SendMessage(`  Active Mute?: ${muteDisplay}`);
        player.SendMessage(`  Active Ban?: ${banDisplay}`);
        player.SendMessage(`  Past Actions?: ${actionsDisplay}`);
        player.SendMessage(`  Notes?: ${notesDisplay}`);
        player.SendMessage(`------------------------------------------`);
    }
}
