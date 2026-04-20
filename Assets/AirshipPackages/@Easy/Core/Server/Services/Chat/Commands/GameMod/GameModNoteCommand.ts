import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { ModerationServiceBridgeTopics, ServerBridgeApiGameModAddNote } from "@Easy/Core/Server/ProtectedServices/Airship/Moderation/ModerationService";
import { GameModerationCommand } from "./GameModCommandHelper";

export class GameModNoteCommand extends ChatCommand {
    constructor() {
        super(GameModerationCommand.NOTE, [], "/note <username> <note>", "Adds a note to a player's moderation profile.", true);
        this.requiresPermission = true; // Granted by having moderation role and note permission for current game
    }

    public Execute(modPlayer: Player, args: string[]): void {
        if (args.size() === 0) {
            modPlayer.SendMessage(ChatColor.Red(`Invalid usage: /note <username> <note>`));
            return;
        }

        const targetUsername = args[0];
        const reason = args[1];

        const target = Airship.Players.FindByFuzzySearch(targetUsername);
        if (!target) {
            modPlayer.SendMessage(ChatColor.Red(`Player not found: ${targetUsername}`));
            return;
        }
        
        const note = contextbridge.invoke<ServerBridgeApiGameModAddNote>(
            ModerationServiceBridgeTopics.GameModerationAddNote,
            LuauContext.Protected,
            modPlayer.userId,
            {
                uid: target.userId,
                gameId: Game.gameId,
                note: reason,
            }
        );
        if (note) {
            modPlayer.SendMessage(`Added note to ${target.username} with content: ${note.reason}`);
        } else {
            modPlayer.SendMessage(ChatColor.Red(`Failed to add note to ${target.username}.`));
        }
    }
}
