/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/compiler-types" />
import { DamageType } from "../../Damage/DamageType";
import { ItemDef } from "../../Item/ItemDefinitionTypes";
import { Bin } from "../../Util/Bin";
import { Entity, EntityReferences } from "../Entity";
export declare enum ItemAnimationId {
    IDLE = "Idle",
    EQUIP = "Equip",
    UN_EQUIP = "UnEquip",
    USE = "Use"
}
export declare enum ItemPlayMode {
    DEFAULT = 0,
    LOOP = 1,
    HOLD = 2
}
export declare class CharacterEntityAnimator {
    readonly entity: Entity;
    readonly refs: EntityReferences;
    private worldmodelClips;
    private viewmodelClips;
    private currentItemMeta;
    private currentItemState;
    private currentEndEventConnection;
    private defaultIdleAnimFP;
    private defaultIdleAnimFPUnarmed;
    private defaultIdleAnimTP;
    private readonly flashTransitionDuration;
    private readonly flashOnTime;
    readonly WorldmodelAnimancerComponent: AnimancerComponent;
    readonly DefaultTransitionTime: number;
    protected bin: Bin;
    private flinchClipFPS?;
    private deathClipFPS?;
    private flinchClipTP?;
    private deathClipTP?;
    private damageEffectTemplate?;
    private deathEffectTemplate?;
    private deathEffectVoidTemplate?;
    private isFlashing;
    protected isFirstPerson: boolean;
    protected viewModelEnabled: boolean;
    private footstepAudioBundle;
    private slideAudioBundle;
    private steppedOnBlockType;
    private lastFootstepSoundTime;
    private deathVfx?;
    BaseFootstepVolumeScale: number;
    private itemAnimStates;
    constructor(entity: Entity, refs: EntityReferences);
    private Log;
    SetFirstPerson(isFirstPerson: boolean): void;
    PlayTakeDamage(flinchDuration: number, damageType: DamageType, position: Vector3, entityModel: GameObject | undefined): void;
    PlayItemAnimationInWorldmodel(clip: AnimationClip, layer: number, onEnd?: Callback, config?: {
        fadeMode?: FadeMode;
        wrapMode?: WrapMode;
        fadeInDuration?: number;
        fadeOutDuration?: number;
        autoFadeOut?: boolean;
    }): AnimancerState | undefined;
    PlayItemAnimationInViewmodel(clip: AnimationClip, layer: number, onEnd?: Callback, config?: {
        fadeMode?: FadeMode;
        wrapMode?: WrapMode;
        fadeInDuration?: number;
        fadeOutDuration?: number;
        autoFadeOut?: boolean;
    }): AnimancerState | undefined;
    ClearItemAnimations(): void;
    private LoadNewItemResources;
    private TriggerEvent;
    EquipItem(itemMeta: ItemDef | undefined): void;
    StartItemIdleAnim(instantTransition: boolean): void;
    PlayItemUseAnim(useIndex?: number, config?: {
        fadeMode?: FadeMode;
        wrapMode?: WrapMode;
        fadeInDuration?: number;
        fadeOutDuration?: number;
        autoFadeOut?: boolean;
    }): void;
    PlayRandomItemUseAnim(config?: {
        fadeMode?: FadeMode;
        wrapMode?: WrapMode;
        transitionTime?: number;
        autoFadeOut?: boolean;
    }): void;
    PlayDeath(damageType: DamageType): void;
    private PlayDamageFlash;
    SetFresnelColor(color: Color, power: number, strength: number): void;
    /**
     *
     * @param volumeScale
     * @param cameraPos Pass in cached camera position if playing lots of sounds to improve performance.
     * @returns
     */
    PlayFootstepSound(volumeScale: number, cameraPos?: Vector3): void;
    private OnAnimationEvent;
    IsFirstPerson(): boolean;
    SetPlaybackSpeed(newSpeed: number): void;
    IsViewModelEnabled(): boolean;
    Destroy(): void;
}
