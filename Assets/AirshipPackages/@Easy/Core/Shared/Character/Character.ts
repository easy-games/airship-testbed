import { Airship } from "@Easy/Core/Shared/Airship";
import { CharacterAnimator } from "@Easy/Core/Shared/Character/Animation/CharacterAnimator";
import { Game } from "@Easy/Core/Shared/Game";
import Inventory from "@Easy/Core/Shared/Inventory/Inventory";
import { HeldItemManager } from "@Easy/Core/Shared/Item/HeldItems/HeldItemManager";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Signal, SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { OutfitDto } from "../Airship/Types/Outputs/AirshipPlatformInventory";
import { AvatarUtil } from "../Avatar/AvatarUtil";

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
	public footstepAudioSource!: AudioSource;
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
	@NonSerialized() public outfitDto: OutfitDto | undefined;
	public spineBone!: Transform;
	public headBone!: Transform;

	// Signals
	@NonSerialized() public onDeath = new Signal<void>();
	@NonSerialized() public onDespawn = new Signal<void>();
	@NonSerialized() public onStateChanged = new Signal<[newState: CharacterState, oldState: CharacterState]>();
	@NonSerialized() public onHealthChanged = new Signal<[newHealth: number, oldHealth: number]>();

	private despawned = false;

	public Awake(): void {
		this.inventory = this.gameObject.GetAirshipComponent<Inventory>()!;
		this.animator = new CharacterAnimator(this);
		this.rig = this.rigRoot.GetComponent<CharacterRig>()!;
	}

	public LateUpdate(dt: number): void {
		// const vec = this.movement.GetLookVector();
		// // -10 is an offset to account for players naturally looking down at horizon
		// let degX = -math.deg(vec.y) - 10;
		// const spinEul = this.spineBone.rotation.eulerAngles;
		// this.spineBone.rotation = Quaternion.Euler(degX * 0.3, spinEul.y, spinEul.z);
		// const neckEul = this.headBone.rotation.eulerAngles;
		// this.headBone.rotation = Quaternion.Euler(degX * 0.8, neckEul.y, neckEul.z);
	}

	public OnEnable(): void {
		this.despawned = false;

		this.spineBone = this.rig.spine;
		this.headBone = this.rig.head;
		if (this.IsLocalCharacter()) {
			task.spawn(() => {
				Game.WaitForLocalPlayerLoaded();
				this.gameObject.name = "Character_" + Game.localPlayer.username;
			});
		}
		this.bin.Add(
			Airship.damage.onDamage.ConnectWithPriority(SignalPriority.MONITOR, (damageInfo) => {
				if (damageInfo.gameObject.GetInstanceID() === this.gameObject.GetInstanceID()) {
					if (this.IsDead()) return;
					let newHealth = math.max(0, this.health - damageInfo.damage);

					this.SetHealth(newHealth);

					if (RunUtil.IsServer() && newHealth <= 0) {
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
				if (this.state === state) return;
				const oldState = this.state;
				this.state = state;
				this.onStateChanged.Fire(state, oldState);
			});
			this.bin.Add(() => {
				Bridge.DisconnectEvent(conn);
			});
		}
	}

	public OnDisable(): void {
		Airship.characters.UnregisterCharacter(this);
		if (Game.IsClient() && !this.despawned) {
			this.bin.Clean();
			this.despawned = true;
			this.onDespawn.Fire();
			Airship.characters.onCharacterDespawned.Fire(this);
			if (this.player?.character === this) {
				this.player?.SetCharacter(undefined);
			}
		}
	}

	public Init(player: Player | undefined, id: number, outfitDto: OutfitDto | undefined): void {
		this.player = player;
		this.id = id;
		this.outfitDto = outfitDto;
		this.animator.SetViewModelEnabled(player?.IsLocalPlayer() ?? false);
		this.health = 100;
		this.maxHealth = 100;
		this.despawned = false;

		if (outfitDto) {
			AvatarUtil.LoadUserOutfit(outfitDto, this.accessoryBuilder, {
				removeOldClothingAccessories: true,
			});
		}
	}

	/**
	 * This should be called from the server.
	 *
	 * You can call it from the client only when using Client Authoratative characters.
	 */
	public Teleport(pos: Vector3, lookVector?: Vector3): void {
		if (lookVector) {
			this.movement.TeleportAndLook(pos, lookVector);
		} else {
			this.movement.Teleport(pos);
		}
	}

	/**
	 * Despawns this character.
	 *
	 * **SERVER ONLY METHOD**
	 */
	public Despawn(): void {
		assert(Game.IsServer(), "You can only call Character.Despawn() on the server.");
		assert(!this.despawned, "Character has already been despawned");

		this.bin.Clean();
		this.despawned = true;
		this.onDespawn.Fire();
		Airship.characters.onCharacterDespawned.Fire(this);
		if (this.player?.character === this) {
			this.player?.SetCharacter(undefined);
		}
		NetworkUtil.Despawn(this.gameObject);
	}

	public IsDestroyed(): boolean {
		return this.despawned || this.gameObject.IsDestroyed();
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
		return Game.IsClient() && this.player?.userId === Game.localPlayer?.userId;
	}
}
