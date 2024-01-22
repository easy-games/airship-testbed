import { Game } from "Shared/Game";
import { Player } from "Shared/Player/Player";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal } from "Shared/Util/Signal";

export default class Character extends AirshipBehaviour {
	@NonSerialized()
	public player?: Player;

	@Header("References")
	public movement!: CharacterMovement;
	public animationHelper!: CharacterAnimationHelper;
	public model!: GameObject;
	public networkObject!: NetworkObject;

	// State
	@NonSerialized() public id!: number;
	@NonSerialized() public state!: CharacterState;
	private health!: number;
	private maxHealth!: number;

	// Signals
	@NonSerialized() public onDeath = new Signal<void>();
	@NonSerialized() public onStateChanged = new Signal<[newState: CharacterState, oldState: CharacterState]>();
	@NonSerialized() public onHealthChanged = new Signal<[newHealth: number, oldHealth: number]>();

	public Init(player: Player | undefined): void {
		this.player = player;
	}

	public Teleport(pos: Vector3, lookDirection?: Vector3): void {}

	public GetHealth(): number {
		return this.health;
	}

	public SetHealth(health: number): void {
		this.health = health;
	}

	public GetMaxHealth(): number {
		return this.maxHealth;
	}

	public SetMaxHealth(maxHealth: number): void {
		this.maxHealth = maxHealth;
	}

	public IsLocalCharacter(): boolean {
		return RunUtil.IsClient() && this.player?.userId === Game.localPlayer.userId;
	}
}
