import { OnStart } from "../../../../../node_modules/@easy-games/flamework-core";
export declare class BubbleChatController implements OnStart {
    private static MAX_DISPLAYED_MESSAGES;
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
