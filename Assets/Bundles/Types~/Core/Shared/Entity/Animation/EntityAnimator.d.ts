/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { DamageType } from "Shared/Damage/DamageType";
import { Entity, EntityReferences } from "../Entity";
export declare class EntityAnimator {
    protected entity: Entity;
    private readonly RootOverrideLayer;
    private readonly TopMostLayerIndex;
    private readonly flashTransitionDuration;
    private readonly flashOnTime;
    readonly anim: AnimancerComponent;
    readonly defaultTransitionTime: number;
    protected readonly entityRef: EntityReferences;
    private flinchClipFPS?;
    private deathClipFPS?;
    private flinchClipTP?;
    private deathClipTP?;
    private damageEffectTemplate?;
    private deathEffectTemplate?;
    private deathEffectVoidTemplate?;
    private isFlashing;
    private footstepAudioBundle;
    private steppedOnBlockType;
    private lastFootstepSoundTime;
    constructor(entity: Entity, anim: AnimancerComponent, entityRef: EntityReferences);
    PlayAnimation(clip: AnimationClip, layer?: number, wrapMode?: WrapMode): AnimancerState;
    PlayAnimationOnce(clip: AnimationClip, layer?: number, wrapMode?: WrapMode): AnimancerState;
    PlayTakeDamage(damageAmount: number, damageType: DamageType, position: Vector3, entityModel: GameObject | undefined): void;
    PlayDeath(damageType: DamageType): void;
    private PlayDamageFlash;
    PlayFootstepSound(): void;
    private OnAnimationEvent;
}
