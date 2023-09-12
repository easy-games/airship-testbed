import { OnStart } from "@easy-games/flamework-core";
import { ChatCommand } from "../../../Shared/Commands/ChatCommand";
import { LocalEntityController } from "../Character/LocalEntityController";
import { CoreUIController } from "../UI/CoreUIController";
export declare class ChatController implements OnStart {
    private readonly localEntityController;
    private readonly coreUIController;
    private content;
    private chatMessagePrefab;
    private inputField;
    private selected;
    private selectedBin;
    private chatMessageElements;
    private prevSentMessages;
    private historyIndex;
    private commands;
    constructor(localEntityController: LocalEntityController, coreUIController: CoreUIController);
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
