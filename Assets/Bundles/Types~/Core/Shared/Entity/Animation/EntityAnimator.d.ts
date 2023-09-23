/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { DamageType } from "../../Damage/DamageType";
import { Bin } from "../../Util/Bin";
import { BundleGroupNames } from "../../Util/ReferenceManagerResources";
import { Entity, EntityReferences } from "../Entity";
import { ItemPlayMode } from "./CharacterEntityAnimator";
export declare class EntityAnimator {
    protected entity: Entity;
    private readonly RootOverrideLayer;
    private readonly TopMostLayerIndex;
    private readonly flashTransitionDuration;
    private readonly flashOnTime;
    readonly anim: AnimancerComponent;
    readonly defaultTransitionTime: number;
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
    private footstepAudioBundle;
    private slideAudioBundle;
    private steppedOnBlockType;
    private lastFootstepSoundTime;
    private deathVfx?;
    constructor(entity: Entity, anim: AnimancerComponent, entityRef: EntityReferences);
    Destroy(): void;
    PlayAnimation(clip: AnimationClip, layer?: number, wrapMode?: WrapMode): AnimancerState;
    PlayAnimationOnce(clip: AnimationClip, layer?: number, wrapMode?: WrapMode): AnimancerState;
    StartItemIdle(): void;
    PlayItemUse(useIndex?: number, itemPlayMode?: ItemPlayMode): void;
    EquipItem(itemId: BundleGroupNames): void;
    SetFirstPerson(isFirstPerson: boolean): void;
    PlayTakeDamage(damageAmount: number, damageType: DamageType, position: Vector3, entityModel: GameObject | undefined): void;
    PlayDeath(damageType: DamageType): void;
    private PlayDamageFlash;
    PlayFootstepSound(): void;
    private OnAnimationEvent;
}
