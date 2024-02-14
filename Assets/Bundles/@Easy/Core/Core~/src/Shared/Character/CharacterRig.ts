export default class CharacterRig extends AirshipBehaviour {
	@Header("Meshes")
	public bodyMesh?: SkinnedMeshRenderer;
	public headMesh?: SkinnedMeshRenderer;
	public faceMesh?: SkinnedMeshRenderer;

	@Header("Root")
	public rig!: Transform;
	public rootMotion!: Transform;
	public master!: Transform;

	@Header("Spine")
	public hips!: Transform;
	public spine!: Transform;
	public head!: Transform;

	@Header("Left Arm")
	public upperArmL!: Transform;
	public forearmL!: Transform;
	public handL!: Transform;
	public fingersL!: Transform;
	public thumbL!: Transform;

	@Header("Right Arm")
	public upperArmR!: Transform;
	public forearmR!: Transform;
	public handR!: Transform;
	public fingersR!: Transform;
	public thumbR!: Transform;

	@Header("Left Leg")
	public thighL!: Transform;
	public shinL!: Transform;
	public footL!: Transform;

	@Header("Right Leg")
	public thighR!: Transform;
	public shinR!: Transform;
	public footR!: Transform;

	@Header("Accessory Slots")
	public headTop!: Transform;
	public spineChest!: Transform;
}
