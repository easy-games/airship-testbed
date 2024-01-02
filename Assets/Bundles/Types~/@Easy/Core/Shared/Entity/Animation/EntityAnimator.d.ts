/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { DamageType } from "../../Damage/DamageType";
import { ItemDef } from "../../Item/ItemDefinitionTypes";
import { Bin } from "../../Util/Bin";
import { Entity, EntityReferences } from "../Entity";
export declare abstract class EntityAnimator {
    protected entity: Entity;
    private readonly flashTransitionDuration;
    private readonly flashOnTime;
    readonly WorldmodelAnimancer: AnimancerComponent;
    readonly ViewmodelAnimancer: AnimancerComponent;
    readonly DefaultTransitionTime: number;
    protected readonly entityRef: EntityReferences;
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
    constructor(entity: Entity, entityRef: EntityReferences);
    Destroy(): void;
    StartIdleAnim(instantTransition: boolean): void;
    PlayUseAnim(useIndex?: number, config?: {
        fadeMode?: FadeMode;
        wrapMode?: WrapMode;
        fadeInDuration?: number;
        fadeOutDuration?: number;
        autoFadeOut?: boolean;
    }): void;
    EquipItem(itemMeta: ItemDef | undefined): void;
    abstract PlayAnimationInWorldmodel(clip: AnimationClip, layer: number, onEnd?: Callback, config?: {
        fadeMode?: FadeMode;
        wrapMode?: WrapMode;
        fadeInDuration?: number;
        fadeOutDuration?: number;
        autoFadeOut?: boolean;
    }): AnimancerState;
    abstract PlayAnimationInViewmodel(clip: AnimationClip, layer: number, onEnd?: Callback, config?: {
        fadeMode?: FadeMode;
        wrapMode?: WrapMode;
        fadeInDuration?: number;
        fadeOutDuration?: number;
        autoFadeOut?: boolean;
    }): AnimancerState;
    SetFirstPerson(isFirstPerson: boolean): void;
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
}
