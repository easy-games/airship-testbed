import { ModerationServiceBridgeTopics, ServerBridgeApiGameModPostAction } from "@Easy/Core/Server/ProtectedServices/Airship/Moderation/ModerationService";
import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ModerationServiceDatabaseTypes } from "@Easy/Core/Shared/TypePackages/moderation-service-types";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { GameModerationCommand } from "./GameModCommandHelper";

/** We already have a kick command so not sure how we want to handle this kick... edit old one or use a diff name for the new one? */
export class GameModKickCommand extends ChatCommand {
    constructor() {
        super(GameModerationCommand.KICK, [], "/modkick <player> <reason?>", "Kicks a player.", true);
        this.requiresPermission = true; // Granted by having moderation role and kick permission for current game
    }

    public Execute(player: Player, args: string[]): void {
        if (args.size() === 0) {
            player.SendMessage(ChatColor.Red(`Invalid usage: /modkick <player> <reason?>`));
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
                actionType: ModerationServiceDatabaseTypes.GameModerationActionType.KICK,
                uid: target.userId,
                gameId: Game.gameId,
                reason
            }
        );
        if (action) {
            player.SendMessage(`Kicked ${target.username} for reason: ${action.reason}`);
        } else {
            player.SendMessage(ChatColor.Red(`Failed to kick ${target.username}.`));
        }
    }
}
