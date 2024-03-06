import { ChatCommand } from "../../../Shared/Commands/ChatCommand";
import { OnStart } from "../../../Shared/Flamework";
export declare class ChatService implements OnStart {
    private commands;
    readonly canUseRichText = true;
    constructor();
    RegisterCommand(command: ChatCommand): void;
    OnStart(): void;
    GetCommands(): ChatCommand[];
}
