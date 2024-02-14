import { OnStart } from "../../../../Shared/Flamework";
export declare class BubbleChatController implements OnStart {
    private static maxDisplayedMessages;
    /** Map from transform to minimized status (true = minimized) */
    private chatContainerMinimized;
    /** Map from chat message to original text */
    private bubbleChatContents;
    OnStart(): void;
    private startSendingRandomMessages;
    private SanitizeRawChatInput;
    private RenderBubble;
    /** Creates a chat container for an entity (or returns one if it already exists) */
    private GetOrCreateChatContainer;
    private ShouldChatBeMinimized;
    private UpdateTextComponentContents;
}
