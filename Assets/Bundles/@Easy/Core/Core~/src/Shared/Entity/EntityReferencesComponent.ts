import { AllBundleItems } from "Shared/Util/ReferenceManagerResources";

export default class EntityReferencesComponent extends AirshipBehaviour {
	private meshRenderers: Renderer[] = [];

	public firstPersonMeshRenderer!: Renderer;
	public bodyMeshRenderer!: Renderer;
	public headMeshRenderer!: Renderer;
	public faceMeshRenderer!: Renderer;

	public neckBone!: Transform;
	public headBone!: Transform;
	public spineBoneRoot!: Transform;
	public spineBoneMiddle!: Transform;
	public spineBoneTop!: Transform;
	public shoulderR!: Transform;
	public shoulderL!: Transform;
	public root!: Transform;
	public rig!: Transform;
	public characterCollider!: Collider;
	public animationEvents!: EntityAnimationEvents;
	public humanEntityAnimator!: CoreEntityAnimator;
	public footstepAudioSource!: AudioSource;

	private slideSoundPaths: Array<string> = [];

	public OnStart(): void {
		this.meshRenderers = [
			this.firstPersonMeshRenderer,
			this.bodyMeshRenderer,
			this.headMeshRenderer,
			this.faceMeshRenderer,
		];

		this.humanEntityAnimator = this.gameObject.GetComponent<CoreEntityAnimator>();
		this.slideSoundPaths[0] = AllBundleItems.Entity_Movement_SlideSFX0;
		this.slideSoundPaths[1] = AllBundleItems.Entity_Movement_SlideSFX1;
		this.slideSoundPaths[2] = AllBundleItems.Entity_Movement_SlideSFX2;
		this.slideSoundPaths[3] = AllBundleItems.Entity_Movement_SlideSFX3;
		this.slideSoundPaths[4] = AllBundleItems.Entity_Movement_SlideSFXLoop;
	}

	public GetMeshRenderers(): Renderer[] {
		return this.meshRenderers;
	}

	public GetSlideSoundPaths(): Array<string> {
		return this.slideSoundPaths;
	}
}
