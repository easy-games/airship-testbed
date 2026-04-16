import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { ModerationServiceDatabaseTypes } from "@Easy/Core/Shared/TypePackages/moderation-service-types";
import { ModerationServiceBridgeTopics, ServerBridgeApiGameModPostAction, ServerBridgeApiGameModRemoveAction } from "@Easy/Core/Server/ProtectedServices/Airship/Moderation/ModerationService";

export class GameModUnmuteCommand extends ChatCommand {
    constructor() {
        super("unmute", [], "/unmute <username> <reason?>", "Unmutes a player.", true);
        this.requiresPermission = true; // Granted by having moderation role and remove mute permission for current game
    }

    public Execute(player: Player, args: string[]): void {
        if (args.size() === 0) {
            player.SendMessage(ChatColor.Red(`Invalid usage: /unmute <username> <reason?>`));
            return;
        }

        const targetUsername = args[0];
        const reason = args[1];

        const target = Airship.Players.FindByFuzzySearch(targetUsername);
        if (!target) {
            player.SendMessage(ChatColor.Red(`Player not found: ${targetUsername}`));
            return;
        }
        
        const action = contextbridge.invoke<ServerBridgeApiGameModRemoveAction>(
            ModerationServiceBridgeTopics.GameModerationRemoveAction,
            LuauContext.Protected,
            {
                actionType: ModerationServiceDatabaseTypes.GameModerationActionType.MUTE,
                uid: target.userId,
                gameId: Game.gameId,
                reason
            }
        );
        if (action) {
            player.SendMessage(`Unmuted ${target.username} for reason: ${action.reason}`);
        } else {
            player.SendMessage(ChatColor.Red(`Failed to unmute ${target.username}.`));
        }
    }
}
