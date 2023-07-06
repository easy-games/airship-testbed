import { DamageType } from "Shared/Damage/DamageType";
import { EffectsManager } from "../../Effects/EffectsManager";
import { BundleReferenceManager } from "../../Util/BundleReferenceManager";
import { Bundle_Entity, Bundle_Entity_OnHit, BundleGroupNames } from "../../Util/ReferenceManagerResources";
import { Task } from "../../Util/Task";
import { Entity, EntityReferences } from "../Entity";
import { SoundUtil } from "../../Util/SoundUtil";
import { ArrayUtil } from "../../Util/ArrayUtil";

export class EntityAnimator {
	private readonly flashTransitionDuration = 0.035;
	private readonly flashOnTime = 0.07;
	public readonly anim: AnimancerComponent;
	public readonly defaultTransitionTime: number = 0.15;
	public damageFlashOnColor: Color = Color.red;
	public damageFlashOffColor: Color = new Color(1, 0, 0, 0);

	protected readonly entityRef: EntityReferences;

	private damageEffectClip?: AnimationClip;
	private damageEffectTemplate?: GameObject;
	private isFlashing = false;

	constructor(protected entity: Entity, anim: AnimancerComponent, entityRef: EntityReferences) {
		this.anim = anim;
		this.entityRef = entityRef;
		this.damageEffectClip = BundleReferenceManager.LoadResource<AnimationClip>(
			BundleGroupNames.Entity,
			Bundle_Entity.OnHit,
			Bundle_Entity_OnHit.GeneralAnim,
		);
		this.damageEffectTemplate = BundleReferenceManager.LoadResource<GameObject>(
			BundleGroupNames.Entity,
			Bundle_Entity.OnHit,
			Bundle_Entity_OnHit.GenericVFX,
		);

		//Listen to animation events
		this.entityRef.animationEvents.OnEntityAnimationEvent((data) => {
			//print("Animation Event: " + data.key + " On Entity: " + this.entity.id);
			this.OnAnimationEvent(data);
		});
	}

	public PlayAnimation(clip: AnimationClip, layer = 0, wrapMode: WrapMode = WrapMode.Default): AnimancerState {
		return AnimancerBridge.Play(this.anim, clip, layer, this.defaultTransitionTime, FadeMode.FromStart, wrapMode);
	}

	public PlayAnimationOnce(clip: AnimationClip, layer = 0, wrapMode: WrapMode = WrapMode.Default): AnimancerState {
		return AnimancerBridge.PlayOnce(this.anim, clip, layer, this.defaultTransitionTime, FadeMode.FromStart);
	}

	public PlayTakeDamage(
		damageAmount: number,
		damageType: DamageType,
		position: Vector3,
		entityModel: GameObject | undefined,
	) {
		//Flash Red 3 times
		let totalTime = this.flashTransitionDuration + this.flashOnTime + this.flashTransitionDuration + 0.01;
		this.PlayFlash();
		Task.Delay(totalTime, () => {
			this.PlayFlash();
			Task.Delay(totalTime, () => {
				this.PlayFlash();
			});
		});

		//Play specific effects for different damage types like fire attacks or magic damage
		let vfxTemplate;
		switch (damageType) {
			default:
				vfxTemplate = this.damageEffectTemplate;
				break;
		}
		if (vfxTemplate) {
			const go = EffectsManager.SpawnEffectAtPosition(vfxTemplate, position);
			if (entityModel) {
				go.transform.parent = entityModel.transform;
			}
		}
	}

	private PlayFlash() {
		if (this.entity.IsDestroyed() || this.isFlashing) return;
		let allMeshes = ArrayUtil.Combine(this.entity.GetAccessoryMeshes(AccessorySlot.Root), this.entityRef.meshes);
		const duration = this.flashTransitionDuration + this.flashOnTime;
		this.isFlashing = true;
		allMeshes.forEach((renderer) => {
			if (renderer && renderer.enabled) {
				renderer
					.TweenMaterialsProperty(
						"_OverlayColor",
						this.damageFlashOffColor,
						this.damageFlashOnColor,
						this.flashTransitionDuration,
					)
					.SetPingPong();
			}
		});
		Task.Delay(duration, () => {
			this.isFlashing = false;
		});
	}

	private OnAnimationEvent(data: EntityAnimationEventData) {
		let meta = this.entity.GetBlockBelowMeta();
		switch (data.key) {
			case EntityAnimationEventKey.FOOTSTEP:
				//Play footstep sound
				if (meta && meta.stepSound) {
					SoundUtil.PlayAtPosition("Footsteps/" + meta.stepSound[0], this.entity.model.transform.position, {
						volumeScale: 1,
					});
				}
				break;
		}
	}
}
