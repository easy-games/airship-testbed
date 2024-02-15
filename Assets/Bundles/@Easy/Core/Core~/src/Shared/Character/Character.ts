import { Airship } from "Shared/Airship";
import { CharacterAnimator } from "Shared/Character/Animation/CharacterAnimator";
import { Game } from "Shared/Game";
import Inventory from "Shared/Inventory/Inventory";
import { HeldItemManager } from "Shared/Item/HeldItems/HeldItemManager";
import { Player } from "Shared/Player/Player";
import { Bin } from "Shared/Util/Bin";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal, SignalPriority } from "Shared/Util/Signal";

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
	public rigRoot!: GameObject;
	public collider!: CharacterController;
	@NonSerialized() public rig!: CharacterRig;

	// State
	@NonSerialized() public id!: number;
	@NonSerialized() public state!: CharacterState;
	@Header("State")
	private health = 100;
	private maxHealth = 100;
	/** A bin that is cleaned when the entity despawns. */
	@NonSerialized() public readonly bin = new Bin();
	@NonSerialized() public inventory!: Inventory;
	@NonSerialized() public heldItems!: HeldItemManager;

	// Signals
	@NonSerialized() public onDeath = new Signal<void>();
	@NonSerialized() public onDespawn = new Signal<void>();
	@NonSerialized() public onStateChanged = new Signal<[newState: CharacterState, oldState: CharacterState]>();
	@NonSerialized() public onHealthChanged = new Signal<[newHealth: number, oldHealth: number]>();

	private despawned = false;

	public Awake(): void {
		this.inventory = this.gameObject.GetAirshipComponent<Inventory>()!;
		this.animator = new CharacterAnimator(this);
		this.rig = this.rigRoot.GetComponent<CharacterRig>();
	}

	public Start(): void {
		if (this.IsLocalCharacter()) {
			task.spawn(() => {
				Game.WaitForLocalPlayerLoaded();
				this.gameObject.name = "Character_" + Game.localPlayer.username;
			});
		}

		this.bin.Add(
			Airship.damage.onDamage.ConnectWithPriority(SignalPriority.MONITOR, (damageInfo) => {
				if (damageInfo.gameObject.GetInstanceID() === this.gameObject.GetInstanceID()) {
					let newHealth = math.max(0, this.health - damageInfo.damage);
					this.SetHealth(newHealth);

					if (newHealth <= 0) {
						Airship.damage.BroadcastDeath(damageInfo);
					}
				}
			}),
		);
		this.bin.Add(
			Airship.damage.onDeath.ConnectWithPriority(SignalPriority.MONITOR, (damageInfo) => {
				if (damageInfo.gameObject === this.gameObject) {
					this.onDeath.Fire();
				}
			}),
		);

		{
			// state change
			const conn = this.movement.OnStateChanged((state) => {
				const oldState = this.state;
				this.state = state;
				this.onStateChanged.Fire(state, oldState);
			});
			this.bin.Add(() => {
				Bridge.DisconnectEvent(conn);
			});
		}
	}

	public Init(player: Player | undefined, id: number): void {
		this.player = player;
		this.id = id;
		this.animator.SetViewModelEnabled(player?.IsLocalPlayer() ?? false);
		this.despawned = false;
	}

	/**
	 * This should be called from the server.
	 *
	 * You can call it from the client only when using Client Authoratative characters.
	 */
	public Teleport(pos: Vector3, lookDirection?: Vector3): void {
		this.movement.Teleport(pos);
	}

	/**
	 * Despawns this character.
	 *
	 * **SERVER ONLY METHOD**
	 */
	public Despawn(): void {
		assert(RunUtil.IsServer(), "You can only call Character.Despawn() on the server.");
		assert(!this.despawned, "Character has already been despawned");

		this.despawned = true;
		this.onDespawn.Fire();
		Airship.characters.onCharacterDespawned.Fire(this);
		this.player?.SetCharacter(undefined);
		NetworkUtil.Despawn(this.gameObject);
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
		const oldHealth = this.health;
		this.health = health;
		this.onHealthChanged.Fire(health, oldHealth);
	}

	public GetMaxHealth(): number {
		return this.maxHealth;
	}

	public SetMaxHealth(maxHealth: number): void {
		this.maxHealth = maxHealth;
	}

	public IsLocalCharacter(): boolean {
		return RunUtil.IsClient() && this.player?.userId === Game.localPlayer?.userId;
	}
}
