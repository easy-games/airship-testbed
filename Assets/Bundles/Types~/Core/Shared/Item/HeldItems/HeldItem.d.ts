import { Entity } from "../../Entity/Entity";
import { ItemMeta } from "../ItemMeta";
export declare class HeldItem {
    private serverOffsetMargin;
    protected readonly meta: ItemMeta;
    protected readonly entity: Entity;
    private lastUsedTime;
    private chargeStartTime;
    protected isCharging: boolean;
    protected currentItemGOs: GameObject[];
    protected currentItemAnimations: Animator[];
    private holdingDownBin;
    private holdingDown;
    constructor(entity: Entity, newMeta: ItemMeta);
    protected Log(message: string): void;
    OnEquip(): void;
    OnUnEquip(): void;
    OnCallToActionStart(): void;
    private HoldDownAction;
    OnCallToActionEnd(): void;
    OnSecondaryActionStart(): void;
    OnSecondaryActionEnd(): void;
    OnInspect(): void;
    protected OnChargeStart(): void;
    protected OnChargeEnd(): void;
    protected TryUse(): boolean;
    protected TryChargeUse(): boolean;
    protected TriggerUse(useIndex: number): void;
    /** Runs when an item is used. Runs on every client.*/
    protected OnUseClient(useIndex: number): void;
    protected SetItemAnimationPauseOnEndFrame(pauseOnEndFrame: boolean): void;
    /** Runs when an item is used, server authorized
     * return true if you can use the item */
    protected OnUseServer(useIndex: number): void;
    IsCooledDown(): boolean;
    IsChargedUp(): boolean;
    HasChargeTime(): boolean;
}
