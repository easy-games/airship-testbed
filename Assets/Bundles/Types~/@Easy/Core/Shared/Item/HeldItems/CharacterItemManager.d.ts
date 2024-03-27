import Character from "../../Character/Character";
import { HeldItemManager } from "./HeldItemManager";
export declare class CharacterItemManager {
    private characterItemManagers;
    private localCharacter?;
    private userActionIds;
    private inputBin;
    private Log;
    OnStart(): void;
    private InitializeClient;
    private TriggerNewState;
    OverwriteInputActions(actionIds: string[]): void;
    AddInputAction(action: string): void;
    private ConnectToInputs;
    private InitializeServer;
    GetOrCreateItemManager(character: Character): HeldItemManager;
    private DestroyItemManager;
}
