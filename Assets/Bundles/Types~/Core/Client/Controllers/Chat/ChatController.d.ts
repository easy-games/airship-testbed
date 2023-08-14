import { OnStart } from "@easy-games/flamework-core";
import { ChatCommand } from "../../../Shared/Commands/ChatCommand";
import { LocalEntityController } from "../Character/LocalEntityController";
export declare class ChatController implements OnStart {
    private localEntityController;
    private content;
    private chatMessagePrefab;
    private inputField;
    private selected;
    private selectedBin;
    private chatMessageElements;
    private prevSentMessages;
    private historyIndex;
    private commands;
    constructor(localEntityController: LocalEntityController);
    RegisterCommand(command: ChatCommand): void;
    OnStart(): void;
    private CheckIfShouldHide;
    ShowAllChatMessages(): void;
    SubmitInputField(): void;
    SendChatMessage(message: string): void;
    AddChatMessage(message: string): void;
    ClearChatMessages(): void;
    IsChatFocused(): boolean;
}
