import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { ModerationServiceDatabaseTypes } from "@Easy/Core/Shared/TypePackages/moderation-service-types";
import { ModerationServiceBridgeTopics, ServerBridgeApiGameModPostAction } from "@Easy/Core/Server/ProtectedServices/Airship/Moderation/ModerationService";
import { GameModerationCommand } from "./GameModCommandHelper";

export class GameModMuteCommand extends ChatCommand {
    constructor() {
        super(GameModerationCommand.MUTE, [], "/mute <username> <reason?>", "Permanently mutes a player.", true);
        this.requiresPermission = true; // Granted by having moderation role and permanent mute permission for current game
    }

    public Execute(player: Player, args: string[]): void {
        if (args.size() === 0) {
            player.SendMessage(ChatColor.Red(`Invalid usage: /mute <username> <reason?>`));
            return;
        }

        const targetUsername = args[0];
        const reason = args[1];

        const target = Airship.Players.FindByFuzzySearch(targetUsername);
        if (!target) {
            player.SendMessage(ChatColor.Red(`Player not found: ${targetUsername}`));
            return;
        }
        
        const action = contextbridge.invoke<ServerBridgeApiGameModPostAction>(
            ModerationServiceBridgeTopics.GameModerationPostAction,
            LuauContext.Protected,
            {
                actionType: ModerationServiceDatabaseTypes.GameModerationActionType.MUTE,
                uid: target.userId,
                gameId: Game.gameId,
                reason
            }
        );
        if (action) {
            player.SendMessage(`Permanently muted ${target.username} for reason: ${action.reason}`);
        } else {
            player.SendMessage(ChatColor.Red(`Failed to permanently mute ${target.username}.`));
        }
    }
}
