export declare class EntityItemManager {
    private static instance;
    static Get(): EntityItemManager;
    private entityItems;
    private localEntity?;
    private mouseIsDown;
    private Log;
    constructor();
    private InitializeClient;
    private InitializeServer;
    private GetOrCreateItemManager;
    private DestroyItemManager;
}
