/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Entity } from "../../Entity/Entity";
import { ItemMeta } from "../ItemMeta";
export declare class HeldItem {
    private serverOffsetMargin;
    /** Undefined when holding nothing */
    protected readonly itemMeta: ItemMeta | undefined;
    protected clickBufferMargin: number;
    readonly entity: Entity;
    private lastUsedTime;
    private chargeStartTime;
    protected isCharging: boolean;
    protected activeAccessories: ActiveAccessory[];
    protected currentItemGOs: GameObject[];
    protected currentItemAnimations: Animator[];
    private holdingDownBin;
    private holdingDown;
    private bufferingUse;
    protected audioPitchShift: number;
    protected playEffectsOnUse: boolean;
    /**
     * The look vector for the latest action.
     *
     * It's recommended to use this instead of `entity.GetLookVector()` as it has higher precision.
     * This vector will match the exact direction the entity was facing during the frame they clicked (as opposed to the tick they clicked).
     */
    protected lookVector: Vector3;
    constructor(entity: Entity, newMeta: ItemMeta | undefined);
    /**
     * Internally used to update the current look vector.
     */
    SetLookVector(vec: Vector3): void;
    protected Log(message: string): void;
    OnEquip(): void;
    /**
     * Called when the HeldItem's art assets (such as animations) should be loaded.
     */
    OnLoadAssets(): void;
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
    protected OnCooldownReset(): void;
    /** Runs when an item is used. Runs on every client.*/
    protected OnUseClient(useIndex: number): void;
    protected PlayItemSound(): void;
    protected PlayAnimationOnItem(index: number, pauseOnEndFrame?: boolean): void;
    protected StopAnimationOnItem(): void;
    protected SetItemAnimationPauseOnEndFrame(pauseOnEndFrame: boolean): void;
    /** Runs when an item is used, server authorized
     * return true if you can use the item */
    protected OnUseServer(useIndex: number): void;
    GetRemainingCooldownTime(): number;
    IsChargedUp(): boolean;
    HasChargeTime(): boolean;
}
