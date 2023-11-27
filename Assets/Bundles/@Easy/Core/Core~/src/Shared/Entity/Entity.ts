import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
import { EntityController } from "Client/Controllers/Entity/EntityController";
import { PlayerController } from "Client/Controllers/Player/PlayerController";
import { DamageService } from "Server/Services/Damage/DamageService";
import { EntityService } from "Server/Services/Entity/EntityService";
import { PlayerService } from "Server/Services/Player/PlayerService";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Game } from "Shared/Game";
import { BlockMeta } from "Shared/Item/ItemMeta";
import { ItemType } from "Shared/Item/ItemType";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { Player } from "Shared/Player/Player";
import { Projectile } from "Shared/Projectile/Projectile";
import { Team } from "Shared/Team/Team";
import { Healthbar } from "Shared/UI/Healthbar";
import { Bin } from "Shared/Util/Bin";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { AllBundleItems } from "Shared/Util/ReferenceManagerResources";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal } from "Shared/Util/Signal";
import { Theme } from "Shared/Util/Theme";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { CharacterEntityAnimator, ItemPlayMode } from "./Animation/CharacterEntityAnimator";
import { EntityAnimator } from "./Animation/EntityAnimator";
import { EntitySerializer } from "./EntitySerializer";

export interface EntityDto {
	serializer: EntitySerializer;
	id: number;
	/** Fish-net ObjectId */
	nobId: number;
	clientId?: number;
	health: number;
	maxHealth: number;
	displayName: string;
	healthbar?: boolean;
}

const friendlyHealthbarFillColor = Theme.Green;
// ColorUtil.HexToColor("#89CC7F");
const enemyHealthbarFillColor = ColorUtil.HexToColor("#FF4646");

export class EntityReferences {
	meshes: Array<Renderer>;
	fpsMesh: Renderer;
	neckBone: Transform;
	headBone: Transform;
	spineBoneRoot: Transform;
	spineBoneMiddle: Transform;
	spineBoneTop: Transform;
	shoulderR: Transform;
	shoulderL: Transform;
	root: Transform;
	rig: Transform;
	characterCollider: Collider;
	animationEvents: EntityAnimationEvents;
	humanEntityAnimator: CoreEntityAnimator;
	jumpSound: AudioClip | undefined;
	slideSoundPaths: Array<string> = [];
	landSound: AudioClip | undefined;
	footstepAudioSource: AudioSource;

	constructor(ref: GameObjectReferences) {
		let boneKey = "Bones";
		let meshKey = "Meshes";
		let colliderKey = "Colliders";
		let vfxKey = "VFX";

		this.humanEntityAnimator = ref.gameObject.GetComponent<CoreEntityAnimator>();

		//Get the meshes
		let meshesCS: CSArray<Renderer> = ref.GetAllValues<Renderer>(meshKey);
		this.meshes = table.create(meshesCS.Length);
		for (let i = 0; i < meshesCS.Length; i++) {
			this.meshes[i] = meshesCS.GetValue(i);
		}
		this.fpsMesh = ref.GetValue<Renderer>(meshKey, "FirstPerson");
		//Get the bones
		this.neckBone = ref.GetValue<Transform>(boneKey, "Neck");
		this.spineBoneTop = ref.GetValue<Transform>(boneKey, "SpineTop");
		this.spineBoneMiddle = ref.GetValue<Transform>(boneKey, "SpineMiddle");
		this.spineBoneRoot = ref.GetValue<Transform>(boneKey, "SpineRoot");
		this.headBone = ref.GetValue<Transform>(boneKey, "Head");
		this.root = ref.GetValue<Transform>(boneKey, "Root");
		this.rig = ref.GetValue<Transform>(boneKey, "Rig");
		this.shoulderL = ref.GetValue<Transform>(boneKey, "ShoulderL");
		this.shoulderR = ref.GetValue<Transform>(boneKey, "ShoulderR");

		this.characterCollider = ref.GetValue<Collider>(colliderKey, "CharacterController");
		this.characterCollider.enabled = true;

		this.animationEvents = ref.GetValue<EntityAnimationEvents>(vfxKey, "AnimationEvents");
		this.footstepAudioSource = ref.GetValue<AudioSource>(vfxKey, "FootstepAudioSource");

		/*this.jumpSound = AudioManager.LoadFullPathAudioClip(BundleReferenceManager.GetPathForResource(
			BundleGroupNames.Entity,
			Bundle_Entity.Movement,
			Bundle_Entity_Movement.JumpSFX,
		));*/

		//Slide sound path: Shared/Resources/Sound/Movement/s_Movement_Slide_Start_01.wav
		this.slideSoundPaths[0] = AllBundleItems.Entity_Movement_SlideSFX0;
		this.slideSoundPaths[1] = AllBundleItems.Entity_Movement_SlideSFX1;
		this.slideSoundPaths[2] = AllBundleItems.Entity_Movement_SlideSFX2;
		this.slideSoundPaths[3] = AllBundleItems.Entity_Movement_SlideSFX3;
		this.slideSoundPaths[4] = AllBundleItems.Entity_Movement_SlideSFXLoop;

		/*this.landSound = AudioManager.LoadFullPathAudioClip(
			BundleReferenceManager.GetPathForResource(
				BundleGroupNames.Entity,
				Bundle_Entity.Movement,
				Bundle_Entity_Movement.LandSFX,
			),
		);*/
	}
}

export class Entity {
	/** Entity's unique id. */
	public readonly id: number;
	public readonly gameObject: GameObject;
	public readonly networkObject: NetworkObject;
	public readonly entityDriver: EntityDriver;
	public readonly model: GameObject;
	public readonly attributes: EasyAttributes;
	public animator: EntityAnimator;
	public readonly references: EntityReferences;
	public readonly accessoryBuilder: AccessoryBuilder;

	public player: Player | undefined;

	/**
	 * The connection ID of whoever is controlling this entity.
	 * Only exists if this entity is attached to a player.
	 *
	 * **This should NOT be used to uniquely identify an entity.**
	 */
	public readonly ClientId?: number;
	protected health = 100;
	protected maxHealth = 100;
	protected moveDirection = new Vector3();
	protected dead = false;
	protected destroyed = false;
	protected displayName: string;
	protected healthbarEnabled = false;
	protected healthbar?: Healthbar;
	protected state: EntityState;
	protected bin: Bin = new Bin();

	public readonly OnHealthChanged = new Signal<[newHealth: number, oldHealth: number]>();
	public readonly OnDespawn = new Signal<void>();
	public readonly OnPlayerChanged = new Signal<[newPlayer: Player | undefined, oldPlayer: Player | undefined]>();
	public readonly OnAdjustMove = new Signal<[moveModifier: MoveModifier]>();
	public readonly OnMoveDirectionChanged = new Signal<[moveDirection: Vector3]>();
	public readonly OnDisplayNameChanged = new Signal<[displayName: string]>();
	public readonly OnStateChanged = new Signal<[state: EntityState, oldState: EntityState]>();
	public readonly OnDeath = new Signal<void>();
	public readonly OnArmorChanged = new Signal<number>();

	constructor(id: number, networkObject: NetworkObject, clientId: number | undefined) {
		this.id = id;
		this.ClientId = clientId;
		this.networkObject = networkObject;
		this.gameObject = networkObject.gameObject;

		this.attributes = this.gameObject.GetComponent<EasyAttributes>();
		Profiler.BeginSample("EntityReferences.Constructor");
		this.references = new EntityReferences(this.gameObject.GetComponent<GameObjectReferences>());
		Profiler.EndSample();
		this.model = this.references.root.gameObject;
		this.model.transform.localPosition = new Vector3(0, 0, 0);
		Profiler.BeginSample("CharacterEntityAnimator.Constructor");
		this.animator = new CharacterEntityAnimator(
			this,
			this.model.GetComponent<AnimancerComponent>(),
			this.references,
		);
		Profiler.EndSample();
		this.accessoryBuilder = this.gameObject.GetComponent<AccessoryBuilder>();
		this.entityDriver = this.gameObject.GetComponent<EntityDriver>();
		this.state = this.entityDriver.GetState();

		if (this.ClientId !== undefined) {
			if (RunUtil.IsServer()) {
				const player = Dependency<PlayerService>().GetPlayerFromClientId(this.ClientId);
				this.SetPlayer(player);
			} else {
				const player = Dependency<PlayerController>().GetPlayerFromClientId(this.ClientId);
				this.SetPlayer(player);
			}
		}
		if (this.player) {
			this.displayName = this.player.username;
		} else {
			this.displayName = `entity_${this.id}`;
		}

		const impactConn = this.entityDriver.OnImpactWithGround((velocity) => {
			this.animator?.PlayFootstepSound(1.4);
			if (RunUtil.IsServer()) {
				const result = Dependency<DamageService>().InflictFallDamage(this, velocity.y);
				if (result) {
					CoreNetwork.ServerToClient.Entity.FallDamageTaken.Server.FireAllClients(this.id, velocity);
				}
			}
		});
		this.bin.Add(() => {
			Bridge.DisconnectEvent(impactConn);
		});

		if (this.IsLocalCharacter() || RunUtil.IsServer()) {
			const adjustMoveConn = this.entityDriver.OnAdjustMove((moveModifier) => {
				this.OnAdjustMove.Fire(moveModifier);
			});
			this.bin.Add(() => {
				Bridge.DisconnectEvent(adjustMoveConn);
			});
		}

		if (this.IsLocalCharacter() || RunUtil.IsServer()) {
			const movementChangeConn = this.entityDriver.OnMoveDirectionChanged((direction) => {
				this.OnMoveDirectionChanged.Fire(direction);
				this.moveDirection = direction;
			});

			this.bin.Add(() => {
				Bridge.DisconnectEvent(movementChangeConn);
			});
		}

		const stateChangeConn = this.entityDriver.OnStateChanged((newState) => {
			// print("state change (" + this.displayName + "): " + newState);
			const oldState = this.state;
			this.state = newState;
			this.OnStateChanged.Fire(newState, oldState);
		});

		this.bin.Add(() => {
			Bridge.DisconnectEvent(stateChangeConn);
		});

		if (this.IsLocalCharacter()) {
			this.references.footstepAudioSource.spatialBlend = 0;
		} else {
			this.references.footstepAudioSource.spatialBlend = 1;
		}
	}

	public Teleport(pos: Vector3, lookVector?: Vector3) {
		this.entityDriver.Teleport(pos);
		if (lookVector) {
			this.entityDriver.SetLookVector(lookVector);
			if (RunUtil.IsServer() && this.player) {
				CoreNetwork.ServerToClient.Entity.SetLookVector.Server.FireClient(
					this.player.clientId,
					this.id,
					lookVector,
				);
			}
		}
	}

	public AddHealthbar(): void {
		if (RunUtil.IsServer()) {
			this.healthbarEnabled = true;
			CoreNetwork.ServerToClient.Entity.AddHealthbar.Server.FireAllClients(this.id);
			return;
		}
		if (this.IsLocalCharacter()) return;

		let sameTeam = false;
		let team = this.GetTeam();
		if (team && team === Game.LocalPlayer.GetTeam()) {
			sameTeam = true;
		}

		const healthbarGO = PoolManager.SpawnObject(Dependency<EntityController>().entityHealthbarPrefab);
		const transform = healthbarGO.transform;
		transform.SetParent(this.model.transform);
		transform.localPosition = new Vector3(0, 2.2, 0);
		this.healthbar = new Healthbar(transform.GetChild(0), {
			fillColor: sameTeam ? friendlyHealthbarFillColor : enemyHealthbarFillColor,
		});

		this.healthbar.SetValue(this.health / this.maxHealth);
		this.healthbarEnabled = true;
	}

	/**
	 * Gets the current position of this entity
	 * @returns
	 */
	public GetPosition() {
		return this.gameObject.transform.position;
	}

	public GetHealthbar(): Healthbar | undefined {
		return this.healthbar;
	}

	public GetTeam(): Team | undefined {
		return this.player?.GetTeam();
	}

	public CanDamage(entity: Entity): boolean {
		if (entity.HasImmunity()) return false;

		const thisTeam = this.player?.GetTeam();
		const otherTeam = entity.player?.GetTeam();
		if (thisTeam !== undefined && otherTeam !== undefined && thisTeam === otherTeam) {
			return false;
		}

		return true;
	}

	public SetPlayer(player: Player | undefined): void {
		const oldPlayer = this.player;
		this.player = player;
		this.OnPlayerChanged.Fire(player, oldPlayer);
	}

	public SetDisplayName(displayName: string) {
		this.displayName = displayName;
		this.OnDisplayNameChanged.Fire(displayName);
		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.Entity.SetDisplayName.Server.FireAllClients(this.id, displayName);
		}
	}

	public GetHealth(): number {
		return this.health;
	}

	public GetMaxHealth(): number {
		return this.maxHealth;
	}

	public GetEntityDriver(): EntityDriver {
		return this.entityDriver;
	}

	public GetMoveDirection(): Vector3 {
		return this.moveDirection;
	}

	public SetHealth(health: number): void {
		health = math.clamp(health, 0, this.maxHealth);
		if (health === this.health) return;
		const oldHealth = this.health;
		this.health = health;
		this.OnHealthChanged.Fire(health, oldHealth);
		this.healthbar?.SetValue(this.health / this.maxHealth);

		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.Entity.SetHealth.Server.FireAllClients(this.id, this.health);
		}
	}

	public SetMaxHealth(maxHealth: number): void {
		this.maxHealth = maxHealth;

		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.Entity.SetHealth.Server.FireAllClients(this.id, this.health, this.maxHealth);
		}
	}

	/**
	 * It is recommended to use EntityService.DespawnEntity() instead of this.
	 */
	public Destroy(): void {
		this.bin.Clean();
		this.OnDespawn.Fire();
		this.animator.Destroy();
		this.destroyed = true;

		if (this.player && this.id === this.player.character?.id) {
			this.player.SetCharacter(undefined);
		}
		if (this.healthbar) {
			const go = this.healthbar.transform.parent.gameObject;
			this.healthbar.Destroy();
			Object.Destroy(go);
		}
		this.gameObject.name = "DespawnedEntity";

		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.DespawnEntity.Server.FireAllClients(this.id);
			NetworkUtil.Despawn(this.networkObject.gameObject);
		}
	}

	public IsDestroyed(): boolean {
		return this.destroyed;
	}

	public Encode(): EntityDto {
		return {
			serializer: EntitySerializer.DEFAULT,
			id: this.id,
			clientId: this.ClientId,
			nobId: this.networkObject.ObjectId,
			health: this.health,
			maxHealth: this.maxHealth,
			displayName: this.displayName,
			healthbar: this.healthbarEnabled || undefined,
		};
	}

	public IsPlayerOwned(): boolean {
		return this.ClientId !== undefined;
	}

	public IsLocalCharacter(): boolean {
		if (!RunUtil.IsClient()) {
			return false;
		} else {
			return this.ClientId === Dependency<PlayerController>().LocalConnection.ClientId;
		}
	}

	public IsAlive(): boolean {
		return !this.IsDead();
	}

	public static FindById(id: number): Entity | undefined {
		if (RunUtil.IsServer()) {
			return Dependency<EntityService>().GetEntityById(id);
		} else {
			return Dependency<EntityController>().GetEntityById(id);
		}
	}

	public static async WaitForId(id: number): Promise<Entity | undefined> {
		if (RunUtil.IsServer()) {
			return this.FindById(id);
		} else {
			return await Dependency<EntityController>().WaitForId(id);
		}
	}

	public static FindByClientId(id: number): Entity | undefined {
		if (RunUtil.IsServer()) {
			return Dependency<EntityService>().GetEntityByClientId(id);
		} else {
			return Dependency<EntityController>().GetEntityByClientId(id);
		}
	}

	public static FindByCollider(collider: Collider): Entity | undefined {
		let nb = collider.gameObject.GetComponent<NetworkBehaviour>();
		if (nb === undefined) {
			nb = collider.transform.parent.gameObject.GetComponent<NetworkBehaviour>();
		}

		if (nb !== undefined) {
			const split = nb.name.split("_");
			if (split.size() > 0) {
				const entityId = tonumber(split[1])!;
				if (entityId !== undefined) {
					return Entity.FindById(entityId);
				}
			}
		}

		return undefined;
	}

	public static FindByGameObject(gameObject: GameObject): Entity | undefined {
		const split = gameObject.name.split("_");
		if (split.size() > 0) {
			const id = tonumber(split[1]);
			if (id !== undefined) {
				return Entity.FindById(id);
			}
		}
		return undefined;
	}

	public SendItemAnimationToClients(useIndex = 0, animationMode: ItemPlayMode = 0, exceptClientId?: number) {
		if (RunUtil.IsServer()) {
			if (exceptClientId !== undefined) {
				CoreNetwork.ServerToClient.PlayEntityItemAnimation.Server.FireExcept(
					exceptClientId,
					this.id,
					useIndex,
					animationMode,
				);
			} else {
				CoreNetwork.ServerToClient.PlayEntityItemAnimation.Server.FireAllClients(
					this.id,
					useIndex,
					animationMode,
				);
			}
		} else {
			error("Trying to send server event (Item Animation) from client");
		}
	}

	public HasImmunity(): boolean {
		let immuneUntilTime = this.attributes.GetNumber("immunity");
		if (immuneUntilTime !== undefined) {
			return TimeUtil.GetServerTime() < immuneUntilTime;
		}
		return false;
	}

	public GetImmuneUntilTime(): number {
		return this.attributes.GetNumber("immunity") ?? 0;
	}

	public GetLastDamagedTime(): number {
		return this.attributes.GetNumber("last_damaged") ?? 0;
	}

	public TimeSinceLastDamaged(): number {
		return Time.time - this.GetLastDamagedTime();
	}

	public SetLastDamagedTime(time: number): void {
		this.attributes.SetAttribute("last_damaged", time);
	}

	public GrantImmunity(duration: number): void {
		let newTime = TimeUtil.GetServerTime() + duration;

		let currentTime = this.attributes.GetNumber("immunity");
		if (currentTime !== undefined && currentTime > newTime) {
			return;
		}

		this.attributes.SetAttribute("immunity", newTime);
	}

	public GetState(): EntityState {
		return this.state;
	}

	public GetCenterOfMass(): Vector3 {
		return this.model.transform.position.add(this.GetHeadOffset().mul(0.5));
	}

	public GetHeadPosition(): Vector3 {
		const offset = this.GetHeadOffset();
		return this.model.transform.position.add(offset);
	}

	public GetHeadOffset(): Vector3 {
		const state = this.GetState();
		let offset = new Vector3(0, 1.7, 0);
		if (state === EntityState.Crouching) {
			offset = new Vector3(0, 1, 0);
		} else if (state === EntityState.Sliding) {
			offset = new Vector3(0, 0.8, 0);
		}
		return offset;
	}

	public GetMiddlePosition(): Vector3 {
		return this.model.transform.position.add(new Vector3(0, 0.9, 0));
	}

	public LocalOffsetToWorldPoint(localOffset: Vector3) {
		const worldDir = this.model.transform.TransformDirection(localOffset);
		const worldPoint = this.GetMiddlePosition().add(worldDir);
		return worldPoint;
	}

	public GetDisplayName(): string {
		return this.displayName;
	}

	public Kill(): void {
		if (this.dead) return;
		this.dead = true;
		this.OnDeath.Fire();
	}

	public IsDead(): boolean {
		return this.dead;
	}

	public GetBlockBelowMeta(): BlockMeta | undefined {
		return WorldAPI.GetMainWorld()?.GetBlockBelowMeta(this.model.transform.position);
	}

	public GetBin(): Bin {
		return this.bin;
	}

	public GetAccessoryMeshes(slot: AccessorySlot): Renderer[] {
		return this.PushToArray(this.accessoryBuilder.GetAccessoryMeshes(slot));
	}

	private PushToArray<T>(array: CSArray<T>): T[] {
		let results = new Array<any>();
		for (let i = 0; i < array.Length; i++) {
			results.push(array.GetValue(i));
		}
		return results;
	}

	public LaunchProjectile(
		launcherItemType: ItemType | undefined,
		projectileItemType: ItemType,
		launchPos: Vector3,
		velocity: Vector3,
	): AirshipProjectile | undefined {
		const itemMeta = ItemUtil.GetItemMeta(projectileItemType);
		const launcherItemMeta = launcherItemType ? ItemUtil.GetItemMeta(launcherItemType) : undefined; // I kind of wish there was syntactic sugar for this lol

		if (!itemMeta.projectile) {
			return error("Tried to launch item that wasn't a projectile: " + projectileItemType);
		}
		let firstPerson = false;
		if (this.IsLocalCharacter()) {
			firstPerson = Dependency<LocalEntityController>().IsFirstPerson();
		}

		const [, id] = ItemUtil.GetItemTypeComponents(projectileItemType);
		const projectilePath = `@Easy/Core/Shared/Resources/Prefabs/Projectiles/Ammo/${string.lower(id)}.prefab`;
		const projectileLauncher = this.gameObject.GetComponent<ProjectileLauncher>();

		const powerMulitplier = itemMeta.projectileLauncher?.powerMultiplier ?? 1;
		const easyProjectile = projectileLauncher.ClientFire(
			projectilePath,
			launcherItemMeta?.id ?? -1,
			itemMeta.id,
			launchPos,
			velocity,
			itemMeta.projectile.gravity / powerMulitplier,
			0,
		);
		const projectile = new Projectile(easyProjectile, projectileItemType, this);
		if (RunUtil.IsClient()) {
			const clientSignals = import("Client/CoreClientSignals").expect().CoreClientSignals;
			const ProjectileLaunchedClientSignal = import(
				"Client/Controllers/Damage/Projectile/ProjectileLaunchedClientSignal"
			).expect().ProjectileLaunchedClientSignal;

			clientSignals.ProjectileLaunched.Fire(new ProjectileLaunchedClientSignal(projectile));
		}
	}

	public GetArmor(): number {
		return 0;
	}

	public HasHealthbar(): boolean {
		return this.healthbarEnabled;
	}
}
