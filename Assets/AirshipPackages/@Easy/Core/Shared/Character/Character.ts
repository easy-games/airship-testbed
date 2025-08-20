import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import Inventory from "@Easy/Core/Shared/Inventory/Inventory";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Signal, SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { AirshipOutfit } from "../Airship/Types/AirshipPlatformInventory";
import { CoreNetwork } from "../CoreNetwork";
import { DamageInfo, DamageInfoCustomData } from "../Damage/DamageInfo";
import AirshipEmoteSingleton from "../Emote/AirshipEmoteSingleton";
import { Dependency } from "../Flamework";
import { ItemStack } from "../Inventory/ItemStack";
import { BeforeLocalInventoryHeldSlotChanged } from "../Inventory/Signal/BeforeLocalInventoryHeldSlotChanged";
import NametagComponent from "../Nametag/NametagComponent";
import { Keyboard, Mouse } from "../UserInput";
import ObjectUtils from "../Util/ObjectUtils";
import CharacterAnimation from "./Animation/CharacterAnimation";
import CharacterConfigSetup from "./CharacterConfigSetup";
import { EmoteStartSignal } from "./Signal/EmoteStartSignal";

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
	public animation?: CharacterAnimation;

	@Header("Required References")
	public networkIdentity!: NetworkIdentity;

	@Header("Optional References")
	public movement: CharacterMovement;
	public animator: Animator;
	public animationHelper!: CharacterAnimationHelper;
	public accessoryBuilder: AccessoryBuilder;
	public model!: GameObject;
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

	@NonSerialized() public outfitDto: AirshipOutfit | undefined;
	@NonSerialized() public isEmoting = false;

	// Signals
	@NonSerialized() public onDeath = new Signal<void>();
	@NonSerialized() public onDespawn = new Signal<void>();
	@NonSerialized() public onStateChanged = new Signal<[newState: CharacterState, oldState: CharacterState]>();
	@NonSerialized() public onHealthChanged = new Signal<[newHealth: number, oldHealth: number]>();
	@NonSerialized() public onMaxHealthChanged = new Signal<[newMaxHealth: number, oldMaxHealth: number]>();
	@NonSerialized() public onEmoteStart = new Signal<EmoteStartSignal>();
	@NonSerialized() public onEmoteEnd = new Signal<[]>();

	// Inventory and related
	@Header("Inventory")
	@NonSerialized()
	public inventory: Inventory;
	@NonSerialized() public heldItem?: ItemStack;
	@NonSerialized() public heldSlot = 0;
	@NonSerialized() public readonly onHeldSlotChanged = new Signal<number>();
	/** Used to cancel changing held item slots. */
	@NonSerialized() public readonly onBeforeLocalHeldSlotChanged = new Signal<BeforeLocalInventoryHeldSlotChanged>();
	private observeHeldItemBins: Bin[] = [];
	private observeHeldSlotBins: Bin[] = [];

	// Hotbar controlls
	private controlsEnabled = true;
	private lastScrollTime = 0;
	private scrollCooldown = 0.05;

	private displayName = "";
	private initialized = false;
	private despawned = false;
	private prevOutfitEncoded = "";

	// Custom Move Data
	private queuedCustomInputData = new Map<string, unknown>();
	private queuedCustomSnapshotData = new Map<string, unknown>();

	/**
	 * Fires before a new command is created on the client. Use this signal to create anything that will need
	 * to connect to OnAddCustomInputData for the tick about to be processed. Only fires for the local
	 * character.
	 */
	public PreCreateCommand = new Signal<[commandNumber: number]>();
	/**
	 * Fires before command processing.
	 *
	 * This signal does not fire for observers.
	 */
	public PreProcessCommand = new Signal<[Map<string, unknown>, CharacterInputData, boolean]>();
	/**
	 * Allows you to process custom move data attached to character input before the move function is executed.
	 *
	 * This signal does not fire for observers.
	 */
	public OnUseCustomInputData = new Signal<[Map<string, unknown>, CharacterInputData, boolean]>();
	/**
	 * Allows you to process custom move data attached to character input after the move function is executed.
	 *
	 * This signal does not fire for observers.
	 */
	public OnUseCustomInputDataAfterMove = new Signal<[Map<string, unknown>, CharacterInputData, boolean]>();
	/**
	 * Signals when a new input command is begin generated. Use AddCustomInputData() to add custom data to the
	 * command being generated.
	 *
	 * This signal does not fire for observers.
	 */
	public OnAddCustomInputData = new Signal<[commandNumber: number]>();
	/**
	 * Signals when a new snapshot of the current movement state is being generated. Use AddCustomStateData() to add
	 * custom data to the snapshot being generated.
	 *
	 * This signal does not fire for observers.
	 */
	public OnAddCustomSnapshotData = new Signal<[]>();
	/**
	 * Signals that the movement system is being reset to a past snapshot. This will happen during re-simulation on
	 * clients, and during lag compensation on the server. This signal will fire for an observed character if the local
	 * client is replaying.
	 */
	public OnResetToSnapshot = new Signal<[Map<string, unknown>, CharacterSnapshotData]>();
	/**
	 * Signals that the movement system is displaying a character interpolating between the two provided snapshots.
	 * This signal is fired every frame. This only fires for characters being observed. Does not fire on the server,
	 * but may in the future.
	 */
	public OnInterpolateSnapshot = new Signal<
		[Map<string, unknown>, CharacterSnapshotData, Map<string, unknown>, CharacterSnapshotData, number]
	>();
	/**
	 * Signals that the movement system is displaying a character that has just reached the snapshot provided. This
	 * fires during fixed update, but may not fire every fixed update. This only fires for characters being observed.
	 * Will fire on the server for client authoritative characters.
	 */
	public OnInterpolateReachedSnapshot = new Signal<[Map<string, unknown>, CharacterSnapshotData]>();
	private compareResult = true; // used internally for OnCompareSnapshot
	/**
	 * Signals that two snapshots are being compared. Use SetComparisonResult() in this signals callbacks
	 * to modify the result of the comparison.
	 *
	 * This signal only fires when the local client needs to compare it's predicted state (first parameter), to the
	 * server's authoritative state (second parameter).
	 */
	public OnCompareSnapshots = new Signal<
		[Map<string, unknown>, CharacterSnapshotData, Map<string, unknown>, CharacterSnapshotData]
	>();

	public Awake(): void {
		this.inventory = this.gameObject.GetAirshipComponent<Inventory>()!;
		this.rig = this.rigRoot?.GetComponent<CharacterRig>()!;
		this.animation = this.gameObject.GetAirshipComponent<CharacterAnimation>()!;
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
		if (this.model === undefined) {
			this.model = this.gameObject;
		}

		this.despawned = false;
		this.bin.Add(
			Airship.Damage.onDamage.ConnectWithPriority(SignalPriority.MONITOR, (damageInfo) => {
				if (damageInfo.gameObject.GetInstanceID() === this.gameObject.GetInstanceID()) {
					if (this.IsDead()) return;
					let newHealth = math.max(0, this.health - damageInfo.damage);

					this.SetHealth(newHealth, true, true);
				}
			}),
		);
		this.bin.Add(
			Airship.Damage.onDeath.ConnectWithPriority(SignalPriority.MONITOR, (damageInfo) => {
				if (damageInfo.gameObject === this.gameObject) {
					if (this.movement) {
						this.movement.enabled = false;
					}
					this.onDeath.Fire();
				}
			}),
		);

		this.bin.Add(
			Airship.Damage.onHeal.ConnectWithPriority(SignalPriority.MONITOR, (healInfo) => {
				if (healInfo.gameObject.GetInstanceID() === this.gameObject.GetInstanceID()) {
					if (this.IsDead()) return;
					let newHealth = math.min(this.maxHealth, this.health + healInfo.healAmount);

					this.SetHealth(newHealth);
				}
			}),
		);

		// Custom move command data handling:
		if (this.movement) {
			this.SetupMovementConnections();
		} else {
			// We can still set up held item networking using regular signals if they
			// have opted not to use our networked movement.
			this.SetupHeldItemSignalNetworking();
		}
	}

	public OnDisable(): void {
		Airship.Characters.UnregisterCharacter(this);
		for (const bin of this.observeHeldItemBins) {
			bin.Clean();
		}
		this.observeHeldItemBins.clear();
		for (const bin of this.observeHeldSlotBins) {
			bin.Clean();
		}
		this.observeHeldSlotBins.clear();
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

	public Init(
		player: Player | undefined,
		id: number,
		outfitDto: AirshipOutfit | undefined,
		health: number,
		maxHealth: number,
		displayName?: string,
	): void {
		this.player = player;
		this.id = id;
		this.outfitDto = outfitDto;
		this.animation?.SetViewModelEnabled(player?.IsLocalPlayer() ?? false);
		this.health = health;
		this.maxHealth = maxHealth;
		this.despawned = false;
		this.initialized = true;
		if (displayName !== undefined) {
			this.displayName = displayName;
		} else {
			if (player) {
				this.displayName = player.username;
			} else {
				this.displayName = "";
			}
		}

		// print("Outfitdto: " + inspect(outfitDto));
		if (Game.IsClient() && this.IsLocalCharacter()) {
			this.SetupHotbarControls();
		}

		// Client side: update the player's selected outfit to whatever this character has.
		// This may cause an issue if the character is init'd with a random outfit.
		if (player && outfitDto && Game.IsClient()) {
			player.selectedOutfit = outfitDto;
		}
		if (this.accessoryBuilder) {
			if (player) {
				this.SetMeshCacheId(`Player:${player.userId}`);
			}
			this.LoadOutfit(outfitDto);
		}
	}

	/**
	 * Allows the use of signal based networking event if desired even if state based networking for held
	 * items is unavailable.
	 */
	private SetupHeldItemSignalNetworking() {
		if (Game.IsServer()) {
			this.bin.Add(
				CoreNetwork.ClientToServer.Character.SetHeldSlot.server.OnClientEvent((player, slot) => {
					const characterId = player.character?.id;
					if (characterId === undefined) return;
					if (characterId !== this.id) return;
					if (slot === this.heldSlot) return;
					this.SetHeldSlotInternal(slot);
					CoreNetwork.ServerToClient.Character.SetHeldSlot.server.FireExcept(player, characterId, slot);
				}),
			);
		} else {
			this.bin.Add(
				CoreNetwork.ServerToClient.Character.SetHeldSlot.client.OnServerEvent((charId, slot) => {
					if (this.id !== charId) return;
					if (slot === this.heldSlot) return;

					this.SetHeldSlotInternal(slot);
				}),
			);
		}
	}

	private SetupHeldItemStateNetworking() {
		this.WaitForInit();

		// Send client held slot to the server
		if (this.IsLocalCharacter()) {
			if (this.movement.IsAuthority()) {
				// If we are authority, send held slot in the snapshot
				this.bin.Add(
					this.OnAddCustomSnapshotData.ConnectWithPriority(SignalPriority.MONITOR, () => {
						this.AddCustomSnapshotData("s", this.heldSlot);
					}),
				);
			} else {
				// If we are not authority, send it in the input
				this.bin.Add(
					this.OnAddCustomInputData.ConnectWithPriority(SignalPriority.MONITOR, () => {
						this.AddCustomInputData("s", this.heldSlot);
					}),
				);
			}
		}

		// Networking for held slot (read held slot data and fire signals on change)
		if (!this.IsLocalCharacter()) {
			if (this.movement.IsAuthority()) {
				let slot = this.heldSlot;
				// Read from client input and set if we are authority. Client has authority over held slot
				this.bin.Add(
					this.OnUseCustomInputData.ConnectWithPriority(SignalPriority.HIGH, (data) => {
						const held = data.get("s") as number;
						if (held === undefined) return;
						if (held === this.heldSlot) return;
						this.SetHeldSlotInternal(held);
						slot = this.heldSlot;
					}),
				);
				// Add held item data to server snapshot so that observers can see it.
				this.bin.Add(
					this.OnAddCustomSnapshotData.ConnectWithPriority(SignalPriority.MONITOR, () => {
						// We send what the client initially sent in the input since we want to client to
						// be authoritative
						this.AddCustomSnapshotData("s", slot);
					}),
				);
			} else {
				// Read from interpolated state and set held item.
				this.bin.Add(
					this.OnInterpolateReachedSnapshot.ConnectWithPriority(SignalPriority.HIGH, (data) => {
						const held = data.get("s") as number;
						if (held === undefined) return;
						if (held === this.heldSlot) return;
						this.SetHeldSlotInternal(held);
					}),
				);
			}
		}
	}

	private SetupMovementConnections() {
		const movementWithSignals = this.movement as CharacterMovement & CharacterMovementEngineEvents;

		this.bin.AddEngineEventConnection(
			movementWithSignals.OnSetMode((mode) => {
				this.SetupHeldItemStateNetworking();
			}),
		);

		let customInput: Map<string, unknown>;
		this.bin.AddEngineEventConnection(
			movementWithSignals.OnProcessCommand((input, state, isReplay) => {
				customInput = this.ParseCustomInputData(input);
				this.PreProcessCommand.Fire(customInput, input, isReplay);
				this.OnUseCustomInputData.Fire(customInput, input, isReplay);
			}),
		);

		this.bin.AddEngineEventConnection(
			movementWithSignals.OnProcessedCommand((input, state, isReplay) => {
				this.OnUseCustomInputDataAfterMove.Fire(customInput, input, isReplay);
			}),
		);

		this.bin.AddEngineEventConnection(
			movementWithSignals.OnInterpolateState((lastState, nextState, delta) => {
				const lastCustomData = this.ParseCustomSnapshotData(lastState);
				const nextCustomData = this.ParseCustomSnapshotData(nextState);
				this.OnInterpolateSnapshot.Fire(lastCustomData, lastState, nextCustomData, nextState, delta);
			}),
		);

		this.bin.AddEngineEventConnection(
			movementWithSignals.OnInterpolateReachedState((state) => {
				const customData = this.ParseCustomSnapshotData(state);
				this.OnInterpolateReachedSnapshot.Fire(customData, state);
			}),
		);

		this.bin.AddEngineEventConnection(
			movementWithSignals.OnCreateCommand((commandNumber) => {
				this.PreCreateCommand.Fire(commandNumber);
				this.CollectCustomInputData(commandNumber);
			}),
		);

		this.bin.AddEngineEventConnection(
			movementWithSignals.OnCaptureSnapshot(() => {
				this.CollectCustomSnapshotData();
			}),
		);

		this.bin.AddEngineEventConnection(
			movementWithSignals.OnCompareSnapshots((a, b) => {
				const aData = this.ParseCustomSnapshotData(a);
				const bData = this.ParseCustomSnapshotData(b);
				this.compareResult = true; // Reset to true for signal use
				this.OnCompareSnapshots.Fire(aData, a, bData, b);
				movementWithSignals.SetComparisonResult(this.compareResult); // TODO: test this works
			}),
		);

		this.bin.AddEngineEventConnection(
			movementWithSignals.OnSetSnapshot((snapshot) => {
				const data = this.ParseCustomSnapshotData(snapshot); // TODO: this is empty for some reason :/
				this.OnResetToSnapshot.Fire(data, snapshot);
			}),
		);

		{
			// state change
			const conn = movementWithSignals.OnStateChanged((state) => {
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

	public SetComparisonResult(result: boolean) {
		if (!this.compareResult) return;
		this.compareResult = result;
	}

	public SetMeshCacheId(cacheId: string | undefined): void {
		// this.accessoryBuilder.meshCombiner.cacheId = cacheId ?? "";
	}

	public LoadOutfit(outfitDto: AirshipOutfit | undefined) {
		if (!this.accessoryBuilder) {
			warn("Cannot load outfit without Accessory Builder set on Character.");
			return;
		}

		this.outfitDto = outfitDto;
		// if (!outfitDto && Game.IsEditor()) {
		// 	outfitDto = json.decode(DEFAULT_EDITOR_OUTFIT);
		// }
		if (Game.IsClient() && outfitDto && this.autoLoadAvatarOutfit) {
			task.spawn(() => {
				// print(`loading outfit for userId ${this.player?.userId}`, json.encode(outfitDto));
				Airship.Avatar.LoadOutfit(this.accessoryBuilder, outfitDto, {
					removeOldClothingAccessories: true,
				});
			});

			// Viewmodel
			if (this.IsLocalCharacter() && Airship.Characters.viewmodel) {
				task.spawn(() => {
					Airship.Avatar.LoadOutfit(Airship.Characters.viewmodel!.accessoryBuilder, outfitDto, {
						removeOldClothingAccessories: true,
					});
				});
			}
		}
	}

	/** Add custom data to the move data command stream. */
	public AddCustomInputData(key: string, value: unknown) {
		this.queuedCustomInputData.set(key, value);
	}

	public AddCustomSnapshotData(key: string, value: unknown) {
		this.queuedCustomSnapshotData.set(key, value);
	}

	private CollectCustomInputData(commandNumber: number) {
		this.OnAddCustomInputData.Fire(commandNumber);
		//Don't process if we have nothing queued
		if (this.queuedCustomInputData.size() === 0) {
			return;
		}
		//Convert queued data into binary blob
		let customInputDataQueue: Record<string, unknown> = {};
		this.queuedCustomInputData.forEach((value, key) => {
			customInputDataQueue[key] = value;
		});
		this.queuedCustomInputData.clear();
		//Pass to C#
		this.movement?.SetCustomInputData(new BinaryBlob(customInputDataQueue));
	}

	private CollectCustomSnapshotData() {
		this.OnAddCustomSnapshotData.Fire();
		//Don't process if we have nothing queued
		if (this.queuedCustomSnapshotData.size() === 0) {
			return;
		}
		//Convert queued data into binary blob
		let customSnapshotDataQueue: Record<string, unknown> = {};
		this.queuedCustomSnapshotData.forEach((value, key) => {
			customSnapshotDataQueue[key] = value;
		});
		this.queuedCustomSnapshotData.clear();
		//Pass to C#
		this.movement?.SetCustomSnapshotData(new BinaryBlob(customSnapshotDataQueue));
	}

	private ParseCustomSnapshotData(snapshot: CharacterSnapshotData): Map<string, unknown> {
		//Decode binary block into usable key value array
		const customData = snapshot.customData;
		const allData = customData ? (customData.Decode() as Record<string, unknown>) : undefined;
		const allCustomData: Map<string, unknown> = new Map();
		if (allData) {
			for (const [key, value] of ObjectUtils.entries(allData)) {
				allCustomData.set(key as string, value);
			}
		}
		return allCustomData;
	}

	private ParseCustomInputData(input: CharacterInputData): Map<string, unknown> {
		//Decode binary block into usable key value array
		const customData = input.customData;
		const allData = customData ? (customData.Decode() as Record<string, unknown>) : undefined;
		const allCustomData: Map<string, unknown> = new Map();
		if (allData) {
			for (const [key, value] of ObjectUtils.entries(allData)) {
				allCustomData.set(key as string, value);
			}
		}
		return allCustomData;
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
	 * This can be called from the server or from the player that owns the character and has authority
	 */
	public Teleport(pos: Vector3, lookVector?: Vector3): void {
		if (!this.movement) {
			warn("Cannot teleport character: movement script missing.");
			return;
		}

		if (lookVector) {
			this.movement.TeleportAndLook(pos, lookVector);
			if (Game.IsClient()) {
				//Airship.Camera.activeCameraMode?.SetDirection(lookVector);
			}
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
	public SetHealth(health: number, dontInflictDeath?: boolean, noNetwork = false): void {
		if (this.health === health) return;

		const oldHealth = this.health;
		this.health = health;
		this.onHealthChanged.Fire(health, oldHealth);

		if (Game.IsServer()) {
			if (!noNetwork) {
				CoreNetwork.ServerToClient.Character.SetHealth.server.FireAllClients(this.id, health);
			}

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
		const oldMaxHealth = this.maxHealth;
		if (oldMaxHealth === maxHealth) return;

		this.maxHealth = maxHealth;
		this.onMaxHealthChanged.Fire(this.maxHealth, oldMaxHealth);

		// If we're a dedicated server network max health to clients
		if (Game.IsServer() && !Game.IsClient()) {
			CoreNetwork.ServerToClient.Character.SetMaxHealth.server.FireAllClients(this.id, this.maxHealth);
		}
	}

	public SetDisplayName(displayName: string) {
		this.displayName = displayName;
		const nametag = this.gameObject.GetAirshipComponentInChildren<NametagComponent>();

		if (nametag !== undefined) {
			nametag.SetText(displayName);
		}

		if (Game.IsServer()) {
			CoreNetwork.ServerToClient.Character.SetNametag.server.FireAllClients(this.id, displayName);
		}
	}

	public GetDisplayName() {
		return this.displayName;
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

	/**
	 * Cancels emote if the character is emoting. Otherwise, does nothing.
	 */
	public CancelEmote(): void {
		if (!this.isEmoting) return;

		// Cancel immediately locally
		Dependency<AirshipEmoteSingleton>().StopEmoting(this);

		if (Game.IsClient() && this.IsLocalCharacter()) {
			CoreNetwork.ClientToServer.Character.EmoteCancelRequest.client.FireServer();
		}
		if (Game.IsServer()) {
			CoreNetwork.ServerToClient.Character.EmoteEnd.server.FireAllClients(this.id);
		}
	}

	public ObserveHeldSlot(
		callback: (heldSlot: number) => CleanupFunc,
		priority: SignalPriority = SignalPriority.NORMAL,
	) {
		const bin = new Bin();
		this.observeHeldItemBins.push(bin);
		let cleanup = callback(this.heldSlot);

		bin.Add(
			this.onHeldSlotChanged.ConnectWithPriority(priority, (newSlot) => {
				if (cleanup !== undefined) {
					task.spawn(() => {
						cleanup!();
					});
				}
				task.spawn(() => {
					cleanup = callback(newSlot);
				});
			}),
		);
		bin.Add(() => {
			cleanup?.();
		});
		return bin;
	}

	public ObserveHeldItem(
		callback: (itemStack: ItemStack | undefined) => CleanupFunc,
		priority: SignalPriority = SignalPriority.NORMAL,
	): Bin {
		const bin = new Bin();
		this.observeHeldItemBins.push(bin);
		let currentItemStack = this.inventory?.GetItem(this.heldSlot);
		let cleanup = callback(currentItemStack);

		bin.Add(
			this.onHeldSlotChanged.ConnectWithPriority(priority, (newSlot) => {
				const selected = this.inventory?.GetItem(newSlot);
				if (selected?.itemType === currentItemStack?.itemType) return;

				if (cleanup !== undefined) {
					task.spawn(() => {
						cleanup!();
					});
				}
				currentItemStack = selected;
				task.spawn(() => {
					cleanup = callback(selected);
				});
			}),
		);
		if (this.inventory) {
			bin.Add(
				this.inventory.onSlotChanged.ConnectWithPriority(priority, (slot, itemStack) => {
					if (slot === this.heldSlot) {
						if (itemStack?.itemType === currentItemStack?.itemType) return;
						if (cleanup !== undefined) {
							task.spawn(() => {
								cleanup!();
							});
						}
						currentItemStack = itemStack;
						task.spawn(() => {
							cleanup = callback(itemStack);
						});
					}
				}),
			);
		}

		bin.Add(() => {
			cleanup?.();
		});
		return bin;
	}

	public GetHeldItem(): ItemStack | undefined {
		return this.inventory.GetItem(this.heldSlot);
	}

	public GetHeldSlot(): number {
		return this.heldSlot;
	}

	/**
	 * Sets the held slot on the character. Can be set for non-local players, but will
	 * be overwritten when a new update is recieved.
	 * @param slot
	 * @returns
	 */
	public SetHeldSlot(slot: number): void {
		if (this.heldSlot === slot) return;

		// Only the client can set held slot.
		if (this.IsLocalCharacter()) {
			const before = this.onBeforeLocalHeldSlotChanged.Fire(
				new BeforeLocalInventoryHeldSlotChanged(slot, this.heldSlot),
			);
			if (before.IsCancelled()) return;
			// Only use signal networking if state based networking is unavailable.
			if (!this.movement) {
				if (Game.IsClient()) {
					CoreNetwork.ClientToServer.Character.SetHeldSlot.client.FireServer(slot);
				} else {
					// If IsLocalCharacter on the server, that means it's a bot (todo)
					CoreNetwork.ServerToClient.Character.SetHeldSlot.server.FireAllClients(this.id, slot);
				}
			}
		}

		this.SetHeldSlotInternal(slot);
	}

	private SetHeldSlotInternal(slot: number): void {
		this.heldSlot = slot;
		this.heldItem = this.GetHeldItem();
		this.onHeldSlotChanged.Fire(slot);
	}

	private SetupHotbarControls() {
		// Controls
		const hotbarKeys = [
			Key.Digit1,
			Key.Digit2,
			Key.Digit3,
			Key.Digit4,
			Key.Digit5,
			Key.Digit6,
			Key.Digit7,
			Key.Digit8,
			Key.Digit9,
		];
		for (const hotbarIndex of $range(0, hotbarKeys.size() - 1)) {
			this.bin.Add(
				Keyboard.OnKeyDown(hotbarKeys[hotbarIndex], (event) => {
					if (event.uiProcessed) return;
					this.SetHeldSlot(hotbarIndex);
				}),
			);
		}

		// Scroll to select held item:
		this.bin.Add(
			Mouse.onScrolled.Connect((event) => {
				if (!this.controlsEnabled || event.uiProcessed || event.IsCancelled()) return;
				if (Mouse.IsOverUI()) return;
				// print("scroll: " + delta);
				if (math.abs(event.delta) < 0.05) return;

				const now = Time.time;
				if (now - this.lastScrollTime < this.scrollCooldown) {
					return;
				}

				this.lastScrollTime = now;

				const selectedSlot = this.GetHeldSlot();
				if (selectedSlot === undefined) return;

				const inc = event.delta < 0 ? 1 : -1;
				let trySlot = selectedSlot;

				// Find the next available item in the hotbar:
				for (const _ of $range(1, hotbarKeys.size())) {
					trySlot += inc;

					// Clamp index to hotbar items:
					if (inc === 1 && trySlot >= hotbarKeys.size()) {
						trySlot = 0;
					} else if (inc === -1 && trySlot < 0) {
						trySlot = hotbarKeys.size() - 1;
					}

					this.SetHeldSlot(trySlot);
					break;
				}
			}),
		);
	}
}
