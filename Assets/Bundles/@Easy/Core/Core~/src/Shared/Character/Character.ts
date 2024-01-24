import { Airship } from "Shared/Airship";
import { CharacterAnimator } from "Shared/Character/Animation/CharacterAnimator";
import { Game } from "Shared/Game";
import { Player } from "Shared/Player/Player";
import { Bin } from "Shared/Util/Bin";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal } from "Shared/Util/Signal";

export default class Character extends AirshipBehaviour {
	@NonSerialized()
	public player?: Player;

	@NonSerialized()
	public animator!: CharacterAnimator;

	@Header("References")
	public movement!: CharacterMovement;
	public animationHelper!: CharacterAnimationHelper;
	public accessoryBuilder!: AccessoryBuilder;
	public model!: GameObject;
	public networkObject!: NetworkObject;
	public rig!: GameObject;

	@Header("Bones")
	public headBone!: GameObject;
	public chestBone!: GameObject;

	// State
	@NonSerialized() public id!: number;
	@NonSerialized() public state!: CharacterState;
	@Header("State")
	private health = 100;
	private maxHealth = 100;
	/** A bin that is cleaned when the entity despawns. */
	public readonly bin = new Bin();

	// Signals
	@NonSerialized() public onDeath = new Signal<void>();
	@NonSerialized() public onDespawn = new Signal<void>();
	@NonSerialized() public onStateChanged = new Signal<[newState: CharacterState, oldState: CharacterState]>();
	@NonSerialized() public onHealthChanged = new Signal<[newHealth: number, oldHealth: number]>();

	public Init(player: Player | undefined): void {
		this.player = player;
	}

	public Teleport(pos: Vector3, lookDirection?: Vector3): void {}

	public OnDisable(): void {
		this.onDespawn.Fire();
		if (Airship.characters) {
			Airship.characters.onCharacterDespawned.Fire(this);
		}
	}

	public IsDestroyed(): boolean {
		return this.gameObject.IsDestroyed();
	}

	public IsAlive(): boolean {
		return this.health > 0;
	}

	public IsDead(): boolean {
		return !this.IsAlive();
	}

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
