import { Player } from "Shared/Player/Player";

export default class Character extends AirshipBehaviour {
	@NonSerialized()
	public player?: Player;

	@Header("References")
	public movement!: CharacterMovement;
	public animationHelper!: CharacterAnimationHelper;

	public Init(player: Player | undefined): void {
		this.player = player;
	}

	public Teleport(pos: Vector3): void {}
}
