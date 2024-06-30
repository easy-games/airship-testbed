export default class AirshipCharacterViewmodel extends AirshipBehaviour {
	@Header("References")
	public animator!: Animator;
	public rig!: CharacterRig;
	public accessoryBuilder!: AccessoryBuilder;
}
