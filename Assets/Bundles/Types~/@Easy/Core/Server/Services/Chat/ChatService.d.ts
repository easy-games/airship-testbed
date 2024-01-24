import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { ChatCommand } from "../../../Shared/Commands/ChatCommand";
import { Player } from "../../../Shared/Player/Player";
export declare class ChatService implements OnStart {
    private commands;
    readonly canUseRichText = true;
    constructor();
    RegisterCommand(command: ChatCommand): void;
    /**
     *
     * @internal
     * @param player The player
     * @param message The chat message
     * @param canRichText Whether or not the chat message allows rich text
     * @returns
     */
    FormatUserChatMessage(player: Player, message: string, canRichText?: boolean): string;
    OnStart(): void;
    GetCommands(): ChatCommand[];
}
