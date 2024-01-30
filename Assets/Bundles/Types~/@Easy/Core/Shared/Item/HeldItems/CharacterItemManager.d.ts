import Character from "../../Character/Character";
import { HeldItemManager } from "./HeldItemManager";
export declare class EntityItemManager {
    private static instance;
    static Get(): EntityItemManager;
    private characterItemManagers;
    private localCharacter?;
    private mouseIsDownLeft;
    private mouseIsDownRight;
    private Log;
    constructor();
    private InitializeClient;
    private InitializeServer;
    GetOrCreateItemManager(character: Character): HeldItemManager;
    private DestroyItemManager;
}
