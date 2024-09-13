import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import Inventory from "@Easy/Core/Shared/Inventory/Inventory";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Signal, SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { OutfitDto } from "../Airship/Types/Outputs/AirshipPlatformInventory";
import { CoreNetwork } from "../CoreNetwork";
import { DamageInfo, DamageInfoCustomData } from "../Damage/DamageInfo";
import CharacterAnimator from "./Animation/CharacterAnimator";
import CharacterConfigSetup from "./CharacterConfigSetup";

/**
 * A character is a (typically human) object in the scene. It controls movement and default animation.
 * Typically a game would spawn a character for each player. If using the default character it would
 * be dressed with their customized outfit.
 *
 * To spawn a character use {@link Player.SpawnCharacter}.
 * To control your game's default character see {@link CharacterConfigSetup}.
 */
export default class Character extends AirshipBehaviour {
	@NonSerialized()
	public player?: Player;

	@NonSerialized()
	public animator?: CharacterAnimator;

	@Header("References")
	public movement?: CharacterMovement;
	public animationHelper!: CharacterAnimationHelper;
	public accessoryBuilder?: AccessoryBuilder;
	public model!: GameObject;
	public networkIdentity!: NetworkIdentity;
	public rigRoot!: GameObject;
	public footstepAudioSource!: AudioSource;
	@NonSerialized() public rig!: CharacterRig;

	@Header("Variables")
	public autoLoadAvatarOutfit = true;

	// State
	@NonSerialized() public id!: number;
	@NonSerialized() public state!: CharacterState;
	@Header("State")
	private health = 100;
	private maxHealth = 100;
	/** A bin that is cleaned when the entity despawns. */
	@NonSerialized() public readonly bin = new Bin();
	@NonSerialized() public inventory!: Inventory;
	@NonSerialized() public outfitDto: OutfitDto | undefined;

	// Signals
	@NonSerialized() public onDeath = new Signal<void>();
	@NonSerialized() public onDespawn = new Signal<void>();
	@NonSerialized() public onStateChanged = new Signal<[newState: CharacterState, oldState: CharacterState]>();
	@NonSerialized() public onHealthChanged = new Signal<[newHealth: number, oldHealth: number]>();

	private initialized = false;
	private despawned = false;

	/*
	 * [Advanced]
	 *
	 * Custom data that the client sends in their move packet.
	 * Map<id, dataBlob>, inputData, isReplay
	 */
	public OnBeginMove = new Signal<[Map<string, unknown>, MoveInputData, boolean]>();

	public Awake(): void {
		this.inventory = this.gameObject.GetAirshipComponent<Inventory>()!;
		this.rig = this.rigRoot.GetComponent<CharacterRig>()!;
		this.animator = this.gameObject.GetAirshipComponent<CharacterAnimator>()!;
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
		this.bin.Add(
			Airship.Damage.onDamage.ConnectWithPriority(SignalPriority.MONITOR, (damageInfo) => {
				if (damageInfo.gameObject.GetInstanceID() === this.gameObject.GetInstanceID()) {
					if (this.IsDead()) return;
					let newHealth = math.max(0, this.health - damageInfo.damage);

					this.SetHealth(newHealth, true);

					if (Game.IsServer() && newHealth <= 0) {
						Airship.Damage.BroadcastDeath(damageInfo);
					}
				}
			}),
		);
		this.bin.Add(
			Airship.Damage.onDeath.ConnectWithPriority(SignalPriority.MONITOR, (damageInfo) => {
				if (damageInfo.gameObject === this.gameObject) {
					this.onDeath.Fire();
				}
			}),
		);

		// Custom move command data handling:
		if (this.movement) {
			const customDataConn = this.movement.OnBeginMove((moveData, isReplay) => {
				this.BeginMove(moveData, isReplay);
			});
			this.bin.Add(() => {
				Bridge.DisconnectEvent(customDataConn);
			});

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
	}

	public OnDisable(): void {
		Airship.Characters.UnregisterCharacter(this);
		if (Game.IsClient() && !this.despawned) {
			this.bin.Clean();
			this.despawned = true;
			this.onDespawn.Fire();
			Airship.Characters.onCharacterDespawned.Fire(this);
			if (this.player?.character === this) {
				this.player?.SetCharacter(undefined);
			}
		}
	}

	public Init(player: Player | undefined, id: number, outfitDto: OutfitDto | undefined): void {
		this.player = player;
		this.id = id;
		this.outfitDto = outfitDto;
		this.animator?.SetViewModelEnabled(player?.IsLocalPlayer() ?? false);
		this.health = 100;
		this.maxHealth = 100;
		this.despawned = false;
		this.initialized = true;

		if (this.accessoryBuilder) {
			this.LoadUserOutfit(outfitDto);
		}

		if (this.movement) {
			// Apply the queued custom data to movement
			const customDataFlushedConn = this.movement.OnSetCustomData(() => {
				this.ProccessCustomMoveData();
			});
			this.bin.Add(() => {
				Bridge.DisconnectEvent(customDataFlushedConn);
			});
		}
	}

	public LoadUserOutfit(outfitDto: OutfitDto | undefined) {
		if (!this.accessoryBuilder) {
			warn("Cannot load outfit without Accessory Builder set on Character.");
			return;
		}

		this.outfitDto = outfitDto;
		//print("using outfit: " + outfitDto?.name);
		if (Game.IsClient() && outfitDto && this.autoLoadAvatarOutfit) {
			Airship.Avatar.LoadUserOutfitDto(outfitDto, this.accessoryBuilder, {
				removeOldClothingAccessories: true,
			});
		}
	}

	private queuedMoveData = new Map<string, unknown>();
	/** Add custom data to the move data command stream. */
	public AddCustomMoveData(key: string, value: unknown) {
		this.queuedMoveData.set(key, value);
	}

	private ProccessCustomMoveData() {
		//Don't process if we have nothing queued
		if (this.queuedMoveData.size() === 0) {
			return;
		}
		//Convert queued data into binary blob
		let customDataQueue: { key: string; value: unknown }[] = [];
		this.queuedMoveData.forEach((value, key) => {
			customDataQueue.push({ key: key, value: value });
		});
		this.queuedMoveData.clear();
		//Pass to C#
		this.movement?.SetCustomData(new BinaryBlob(customDataQueue));
	}

	private BeginMove(moveData: MoveInputData, isReplay: boolean) {
		//Decode binary block into usable key value array
		const allData = moveData.customData
			? (moveData.customData.Decode() as { key: string; value: unknown }[])
			: undefined;
		const allCustomData: Map<string, unknown> = new Map();
		if (allData) {
			//print("ALLDATA: " + inspect(allData));
			for (const data of allData) {
				//print("Found custom data " + data.key + " with value: " + data.value);
				allCustomData.set(data.key, data.value);
			}
		}

		//Local signal for parsing the key value pairs
		this.OnBeginMove.Fire(allCustomData, moveData, isReplay);
	}

	public IsInitialized() {
		return this.initialized;
	}

	/**
	 * Yields thread until the character has been initialized.
	 */
	public WaitForInit(): void {
		while (!this.initialized) {
			task.wait();
		}
	}

	/**
	 * This should be called from the server.
	 *
	 * You can call it from the client only when using Client Authoratative characters.
	 */
	public Teleport(pos: Vector3, lookVector?: Vector3): void {
		if (!this.movement) {
			warn("Cannot teleport character: movement script missing.");
			return;
		}

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
		Airship.Characters.onCharacterDespawned.Fire(this);
		if (this.player?.character === this) {
			this.player?.SetCharacter(undefined);
		}
		NetworkServer.Destroy(this.gameObject);
	}

	public InflictDamage(damage: number, attacker?: GameObject, data?: DamageInfoCustomData): void {
		Airship.Damage.InflictDamage(this.gameObject, damage, attacker, data);
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

	/**
	 * Sets a characters health to a certain value. If the health is <= 0, the character will die.
	 *
	 * @param health The new health value.
	 * @param dontInflictDeath If true, a death event will not be fired if the character's new health is less than or equal to zero.
	 * This is useful when you want to broadcast a custom death event with {@link Airship.Damage.BroadcastDeath}.
	 */
	public SetHealth(health: number, dontInflictDeath?: boolean): void {
		if (this.health === health) return;

		const oldHealth = this.health;
		this.health = health;
		this.onHealthChanged.Fire(health, oldHealth);

		if (Game.IsServer()) {
			CoreNetwork.ServerToClient.Character.SetHealth.server.FireAllClients(this.id, health);

			if (this.health <= 0 && !dontInflictDeath) {
				const damageInfo = new DamageInfo(this.gameObject, oldHealth, undefined, {});
				Airship.Damage.BroadcastDeath(damageInfo);
			}
		}
	}

	public GetMaxHealth(): number {
		return this.maxHealth;
	}

	public SetMaxHealth(maxHealth: number): void {
		this.maxHealth = maxHealth;
	}

	/**
	 * Used to check if the character is owned by the `Game.localPlayer`
	 *
	 * Must be called after the character has finished initializing.
	 * You can use {@link WaitForInit()} to wait for initialized.
	 *
	 * @returns true if the character is owned by the `Game.localPlayer`
	 */
	public IsLocalCharacter(): boolean {
		if (!this.initialized) {
			print(debug.traceback());
			error("Tried to call IsLocalCharacter() before character was initialized. Please use WaitForInit()");
		}
		return Game.IsClient() && this.player?.userId === Game.localPlayer?.userId;
	}
}
