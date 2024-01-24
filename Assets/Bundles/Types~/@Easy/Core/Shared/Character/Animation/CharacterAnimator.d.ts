/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/compiler-types" />
import Character from "../Character";
import { ItemDef } from "../../Item/ItemDefinitionTypes";
import { Bin } from "../../Util/Bin";
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
export declare class CharacterAnimator {
    readonly character: Character;
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
    readonly worldmodelAnimancerComponent: AnimancerComponent;
    readonly defaultTransitionTime: number;
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
    baseFootstepVolumeScale: number;
    private itemAnimStates;
    constructor(character: Character);
    private Log;
    SetFirstPerson(isFirstPerson: boolean): void;
    PlayTakeDamage(position: Vector3, characterModel: GameObject | undefined): void;
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
    PlayDeath(): void;
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
