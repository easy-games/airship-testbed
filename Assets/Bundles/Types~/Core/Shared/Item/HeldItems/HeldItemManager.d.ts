import { CharacterEntity } from "../../Entity/Character/CharacterEntity";
export declare enum HeldItemState {
    NONE = -1,
    CALL_TO_ACTION_START = 0,
    CALL_TO_ACTION_END = 1,
    ON_DESTROY = 2
}
export declare class HeldItemManager {
    private entity;
    private heldItemMap;
    private currentHeldItem;
    private currentItemState;
    GetLabel(): number;
    private Log;
    private GetOrCreateHeldItem;
    constructor(entity: CharacterEntity);
    TriggerNewState(itemState: HeldItemState): void;
    OnNewState(itemState: HeldItemState): void;
}
