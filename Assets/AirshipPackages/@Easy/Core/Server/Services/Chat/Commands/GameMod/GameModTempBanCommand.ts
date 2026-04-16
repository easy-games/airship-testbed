import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { ValidateModerationActionDurationFormat } from "./GameModCommandHelper";
import { ModerationServiceDatabaseTypes } from "@Easy/Core/Shared/TypePackages/moderation-service-types";
import { ModerationServiceBridgeTopics, ServerBridgeApiGameModPostAction } from "@Easy/Core/Server/ProtectedServices/Airship/Moderation/ModerationService";

export class GameModTempBanCommand extends ChatCommand {
    constructor() {
        super("tempban", [], "/tempban <username> <duration> <reason?>", "Temporarily bans a player.", true);
        this.requiresPermission = true; // Granted by having moderation role and temporary ban permission for current game
    }

    public Execute(player: Player, args: string[]): void {
        if (args.size() === 0) {
            player.SendMessage(ChatColor.Red(`Invalid usage: /tempban <username> <duration> <reason?>`));
            return;
        }

        const targetUsername = args[0];
        const duration = args[1];
        const reason = args[2];

        if (duration && !ValidateModerationActionDurationFormat(duration)) {
            player.SendMessage(ChatColor.Red(`Invalid usage: Duration must be in the format of '#s' '#m' '#h' or '#d'`));
            return;
        }

        const target = Airship.Players.FindByFuzzySearch(targetUsername);
        if (!target) {
            player.SendMessage(ChatColor.Red(`Player not found: ${targetUsername}`));
            return;
        }
        
        const action = contextbridge.invoke<ServerBridgeApiGameModPostAction>(
            ModerationServiceBridgeTopics.GameModerationPostAction,
            LuauContext.Protected,
            {
                actionType: ModerationServiceDatabaseTypes.GameModerationActionType.BAN,
                uid: target.userId,
                gameId: Game.gameId,
                reason,
                duration
            }
        );
        if (action) {
            player.SendMessage(`Temporarily banned ${target.username} with duration ${duration} for reason: ${action.reason}`);
        } else {
            player.SendMessage(ChatColor.Red(`Failed to temporarily ban ${target.username}.`));
        }
    }
}
