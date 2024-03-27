import Character from "../../Character/Character";
import { ItemDef } from "../ItemDefinitionTypes";
export declare class HeldItem {
    private readonly serverOffsetMargin;
    protected readonly itemMeta: ItemDef | undefined;
    /** Undefined when holding nothing */
    readonly character: Character;
    /**
     * The look vector for the latest action.
     *
     * It's recommended to use this instead of `entity.GetLookVector()` as it has higher precision.
     * This vector will match the exact direction the entity was facing during the frame they clicked (as opposed to the tick they clicked).
     */
    protected lookVector: Vector3;
    protected clickBufferMargin: number;
    protected isCharging: boolean;
    protected activeAccessoriesWorldmodel: ActiveAccessory[];
    protected activeAccessoriesViewmodel: ActiveAccessory[];
    protected currentItemGOs: GameObject[];
    protected currentItemAnimations: Animator[];
    protected viewmodelAccessoryBuilder: AccessoryBuilder | undefined;
    protected audioPitchShift: number;
    protected playEffectsOnUse: boolean;
    private holdingDownBin;
    private holdingDown;
    private bufferingUse;
    private lastUsedTime;
    private chargeStartTime;
    protected Log(message: string): void;
    constructor(character: Character, newMeta: ItemDef | undefined);
    /**
     * Internally used to update the current look vector.
     */
    SetLookVector(vec: Vector3): void;
    /**
     * Called when the HeldItem's art assets (such as animations) should be loaded.
     */
    OnLoadAssets(): void;
    /**
     * Returns an array of ActiveAccessories.
     * If the character is in first person, these will be the viewmodel accessories. Otherwise, they are the worldmodel accessories.
     *
     * @returns ActiveAccessories that are enabled in the scene.
     */
    GetActiveAccessories(): ActiveAccessory[];
    OnEquip(): void;
    OnUnEquip(): void;
    OnNewActionState(stateIndex: number, isActive: boolean): void;
    private HoldDownAction;
    protected OnChargeStart(): void;
    protected OnChargeEnd(): void;
    private TryUse;
    private TryChargeUse;
    protected TriggerUse(useIndex: number): void;
    protected OnCooldownReset(): void;
    /** Runs when an item is used. Runs on every client.*/
    protected OnUseClient(useIndex: number): void;
    /** Runs when an item is used, server authorized
     * return true if you can use the item */
    protected OnUseServer(useIndex: number): void;
    protected PlayItemSound(): void;
    protected PlayAnimationOnItem(index: number, pauseOnEndFrame?: boolean): void;
    protected StopAnimationOnItem(): void;
    protected SetItemAnimationPauseOnEndFrame(pauseOnEndFrame: boolean): void;
    GetRemainingCooldownTime(): number;
    IsChargedUp(): boolean;
    HasChargeTime(): boolean;
    protected CanUse(index?: number): boolean;
    protected CanCharge(): boolean;
}
