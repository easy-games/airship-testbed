import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
import { EntityController } from "Client/Controllers/Entity/EntityController";
import { PlayerController } from "Client/Controllers/Player/PlayerController";
import { DamageService } from "Server/Services/Damage/DamageService";
import { EntityService } from "Server/Services/Entity/EntityService";
import { PlayerService } from "Server/Services/Player/PlayerService";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Game } from "Shared/Game";
import { BlockDef } from "Shared/Item/ItemDefinitionTypes";
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
	Meshes: Array<Renderer>;
	FpsMesh: Renderer;
	NeckBone: Transform;
	HeadBone: Transform;
	SpineBoneRoot: Transform;
	SpineBoneMiddle: Transform;
	SpineBoneTop: Transform;
	ShoulderR: Transform;
	ShoulderL: Transform;
	Root: Transform;
	Rig: Transform;
	CharacterCollider: Collider;
	AnimationEvents: EntityAnimationEvents;
	AnimationHelper: CharacterAnimationHelper;
	JumpSound: AudioClip | undefined;
	SlideSoundPaths: Array<string> = [];
	LandSound: AudioClip | undefined;
	FootstepAudioSource: AudioSource;

	constructor(ref: GameObjectReferences) {
		let boneKey = "Bones";
		let meshKey = "Meshes";
		let colliderKey = "Colliders";
		let vfxKey = "VFX";

		this.AnimationHelper = ref.gameObject.GetComponent<CharacterAnimationHelper>();

		//Get the meshes
		let meshesCS: CSArray<Renderer> = ref.GetAllValues<Renderer>(meshKey);
		this.Meshes = table.create(meshesCS.Length);
		for (let i = 0; i < meshesCS.Length; i++) {
			this.Meshes[i] = meshesCS.GetValue(i);
		}
		this.FpsMesh = ref.GetValue<Renderer>(meshKey, "FirstPerson");
		//Get the bones
		this.NeckBone = ref.GetValue<Transform>(boneKey, "Neck");
		this.SpineBoneTop = ref.GetValue<Transform>(boneKey, "SpineTop");
		this.SpineBoneMiddle = ref.GetValue<Transform>(boneKey, "SpineMiddle");
		this.SpineBoneRoot = ref.GetValue<Transform>(boneKey, "SpineRoot");
		this.HeadBone = ref.GetValue<Transform>(boneKey, "Head");
		this.Root = ref.GetValue<Transform>(boneKey, "Root");
		this.Rig = ref.GetValue<Transform>(boneKey, "Rig");
		this.ShoulderL = ref.GetValue<Transform>(boneKey, "ShoulderL");
		this.ShoulderR = ref.GetValue<Transform>(boneKey, "ShoulderR");

		this.CharacterCollider = ref.GetValue<Collider>(colliderKey, "CharacterController");
		this.CharacterCollider.enabled = true;

		this.AnimationEvents = ref.GetValue<EntityAnimationEvents>(vfxKey, "AnimationEvents");
		this.FootstepAudioSource = ref.GetValue<AudioSource>(vfxKey, "FootstepAudioSource");

		/*this.jumpSound = AudioManager.LoadFullPathAudioClip(BundleReferenceManager.GetPathForResource(
			BundleGroupNames.Entity,
			Bundle_Entity.Movement,
			Bundle_Entity_Movement.JumpSFX,
		));*/

		//Slide sound path: Shared/Resources/Sound/Movement/s_Movement_Slide_Start_01.wav
		this.SlideSoundPaths[0] = AllBundleItems.Entity_Movement_SlideSFX0;
		this.SlideSoundPaths[1] = AllBundleItems.Entity_Movement_SlideSFX1;
		this.SlideSoundPaths[2] = AllBundleItems.Entity_Movement_SlideSFX2;
		this.SlideSoundPaths[3] = AllBundleItems.Entity_Movement_SlideSFX3;
		this.SlideSoundPaths[4] = AllBundleItems.Entity_Movement_SlideSFXLoop;

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
	public readonly Id: number;
	public readonly GameObject: GameObject;
	public readonly NetworkObject: NetworkObject;
	public readonly EntityDriver: EntityDriver;
	public readonly Model: GameObject;
	public readonly Attributes: EasyAttributes;
	public Animator: CharacterEntityAnimator;
	public readonly References: EntityReferences;
	public readonly AccessoryBuilder: AccessoryBuilder;

	public Player: Player | undefined;

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
		this.Id = id;
		this.ClientId = clientId;
		this.NetworkObject = networkObject;
		this.GameObject = networkObject.gameObject;

		this.Attributes = this.GameObject.GetComponent<EasyAttributes>();
		this.AccessoryBuilder = this.GameObject.GetComponent<AccessoryBuilder>();
		this.EntityDriver = this.GameObject.GetComponent<EntityDriver>();

		Profiler.BeginSample("EntityReferences.Constructor");
		this.References = new EntityReferences(this.GameObject.GetComponent<GameObjectReferences>());
		Profiler.EndSample();
		this.Model = this.References.Root.gameObject;
		this.Model.transform.localPosition = new Vector3(0, 0, 0);
		Profiler.BeginSample("CharacterEntityAnimator.Constructor");
		this.Animator = new CharacterEntityAnimator(this, this.References);
		Profiler.EndSample();
		this.state = this.EntityDriver.GetState();

		if (this.ClientId !== undefined) {
			if (RunUtil.IsServer()) {
				const player = Dependency<PlayerService>().GetPlayerFromClientId(this.ClientId);
				this.SetPlayer(player);
			} else {
				const player = Dependency<PlayerController>().GetPlayerFromClientId(this.ClientId);
				this.SetPlayer(player);
			}
		}
		if (this.Player) {
			this.displayName = this.Player.username;
		} else {
			this.displayName = `entity_${this.Id}`;
		}

		const impactConn = this.EntityDriver.OnImpactWithGround((velocity) => {
			this.Animator?.PlayFootstepSound(1.4);
			if (RunUtil.IsServer()) {
				const result = Dependency<DamageService>().InflictFallDamage(this, velocity.y);
				if (result) {
					CoreNetwork.ServerToClient.Entity.FallDamageTaken.Server.FireAllClients(this.Id, velocity);
				}
			}
		});
		this.bin.Add(() => {
			Bridge.DisconnectEvent(impactConn);
		});

		if (this.IsLocalCharacter() || RunUtil.IsServer()) {
			const adjustMoveConn = this.EntityDriver.OnAdjustMove((moveModifier) => {
				this.OnAdjustMove.Fire(moveModifier);
			});
			this.bin.Add(() => {
				Bridge.DisconnectEvent(adjustMoveConn);
			});
		}

		if (this.IsLocalCharacter() || RunUtil.IsServer()) {
			const movementChangeConn = this.EntityDriver.OnMoveDirectionChanged((direction) => {
				this.OnMoveDirectionChanged.Fire(direction);
				this.moveDirection = direction;
			});

			this.bin.Add(() => {
				Bridge.DisconnectEvent(movementChangeConn);
			});
		}

		const stateChangeConn = this.EntityDriver.OnStateChanged((newState) => {
			// print("state change (" + this.displayName + "): " + newState);
			const oldState = this.state;
			this.state = newState;
			this.OnStateChanged.Fire(newState, oldState);
		});

		this.bin.Add(() => {
			Bridge.DisconnectEvent(stateChangeConn);
		});

		if (this.IsLocalCharacter()) {
			this.References.FootstepAudioSource.spatialBlend = 0;
		} else {
			this.References.FootstepAudioSource.spatialBlend = 1;
		}
	}

	public Teleport(pos: Vector3, lookVector?: Vector3) {
		this.EntityDriver.Teleport(pos);
		if (lookVector) {
			this.EntityDriver.SetLookVector(lookVector);
			if (RunUtil.IsServer() && this.Player) {
				CoreNetwork.ServerToClient.Entity.SetLookVector.Server.FireClient(
					this.Player.clientId,
					this.Id,
					lookVector,
				);
			}
		}
	}

	public IsHeadshotHitHeight(height: number): boolean {
		const offset = this.GetHeadOffset();
		const diff = math.abs(height - offset.y);
		return diff <= 0.14;
	}

	public IsCrouched(): boolean {
		return this.state === EntityState.Crouching;
	}

	public AddHealthbar(): void {
		if (RunUtil.IsServer()) {
			this.healthbarEnabled = true;
			CoreNetwork.ServerToClient.Entity.AddHealthbar.Server.FireAllClients(this.Id);
			return;
		}
		if (this.IsLocalCharacter()) return;

		let sameTeam = false;
		let team = this.GetTeam();
		if (team && team === Game.LocalPlayer.GetTeam()) {
			sameTeam = true;
		}

		const healthbarGO = PoolManager.SpawnObject(Dependency<EntityController>().EntityHealthbarPrefab);
		const transform = healthbarGO.transform;
		transform.SetParent(this.Model.transform);
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
		return this.GameObject.transform.position;
	}

	public GetHealthbar(): Healthbar | undefined {
		return this.healthbar;
	}

	public GetTeam(): Team | undefined {
		return this.Player?.GetTeam();
	}

	public CanDamage(entity: Entity): boolean {
		if (entity.HasImmunity()) return false;

		const thisTeam = this.Player?.GetTeam();
		const otherTeam = entity.Player?.GetTeam();
		if (thisTeam !== undefined && otherTeam !== undefined && thisTeam === otherTeam) {
			return false;
		}

		return true;
	}

	public SetPlayer(player: Player | undefined): void {
		const oldPlayer = this.Player;
		this.Player = player;
		this.OnPlayerChanged.Fire(player, oldPlayer);
	}

	public SetDisplayName(displayName: string) {
		this.displayName = displayName;
		this.OnDisplayNameChanged.Fire(displayName);
		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.Entity.SetDisplayName.Server.FireAllClients(this.Id, displayName);
		}
	}

	public GetHealth(): number {
		return this.health;
	}

	public GetMaxHealth(): number {
		return this.maxHealth;
	}

	public GetEntityDriver(): EntityDriver {
		return this.EntityDriver;
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
			CoreNetwork.ServerToClient.Entity.SetHealth.Server.FireAllClients(this.Id, this.health);
		}
	}

	public SetMaxHealth(maxHealth: number): void {
		this.maxHealth = maxHealth;

		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.Entity.SetHealth.Server.FireAllClients(this.Id, this.health, this.maxHealth);
		}
	}

	/**
	 * It is recommended to use EntityService.DespawnEntity() instead of this.
	 */
	public Destroy(): void {
		this.bin.Clean();
		this.OnDespawn.Fire();
		this.Animator.Destroy();
		this.destroyed = true;

		if (this.Player && this.Id === this.Player.Character?.Id) {
			this.Player.SetCharacter(undefined);
		}
		if (this.healthbar) {
			const go = this.healthbar.Transform.parent.gameObject;
			this.healthbar.Destroy();
			Object.Destroy(go);
		}
		this.GameObject.name = "DespawnedEntity";

		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.DespawnEntity.Server.FireAllClients(this.Id);
			NetworkUtil.Despawn(this.NetworkObject.gameObject);
		}
	}

	public IsDestroyed(): boolean {
		return this.destroyed;
	}

	public Encode(): EntityDto {
		return {
			serializer: EntitySerializer.DEFAULT,
			id: this.Id,
			clientId: this.ClientId,
			nobId: this.NetworkObject.ObjectId,
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
			return this.ClientId === Dependency<PlayerController>().ClientId;
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
					this.Id,
					useIndex,
					animationMode,
				);
			} else {
				CoreNetwork.ServerToClient.PlayEntityItemAnimation.Server.FireAllClients(
					this.Id,
					useIndex,
					animationMode,
				);
			}
		} else {
			error("Trying to send server event (Item Animation) from client");
		}
	}

	public HasImmunity(): boolean {
		let immuneUntilTime = this.Attributes.GetNumber("immunity");
		if (immuneUntilTime !== undefined) {
			return TimeUtil.GetServerTime() < immuneUntilTime;
		}
		return false;
	}

	public GetImmuneUntilTime(): number {
		return this.Attributes.GetNumber("immunity") ?? 0;
	}

	public GetLastDamagedTime(): number {
		return this.Attributes.GetNumber("last_damaged") ?? 0;
	}

	public TimeSinceLastDamaged(): number {
		return Time.time - this.GetLastDamagedTime();
	}

	public SetLastDamagedTime(time: number): void {
		this.Attributes.SetAttribute("last_damaged", time);
	}

	public GrantImmunity(duration: number): void {
		let newTime = TimeUtil.GetServerTime() + duration;

		let currentTime = this.Attributes.GetNumber("immunity");
		if (currentTime !== undefined && currentTime > newTime) {
			return;
		}

		this.Attributes.SetAttribute("immunity", newTime);
	}

	public GetState(): EntityState {
		return this.state;
	}

	public GetCenterOfMass(): Vector3 {
		return this.Model.transform.position.add(this.GetHeadOffset().mul(0.5));
	}

	public GetHeadPosition(): Vector3 {
		const offset = this.GetHeadOffset();
		return this.Model.transform.position.add(offset);
	}

	public GetHeadOffset(): Vector3 {
		const state = this.GetState();
		let offset = new Vector3(0, 2, 0);
		if (state === EntityState.Crouching) {
			offset = new Vector3(0, 1, 0);
		} else if (state === EntityState.Sliding) {
			offset = new Vector3(0, 0.8, 0);
		}
		return offset;
	}

	public GetFirstPersonHeadOffset(): Vector3 {
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
		return this.Model.transform.position.add(new Vector3(0, 0.9, 0));
	}

	public LocalOffsetToWorldPoint(localOffset: Vector3) {
		const worldDir = this.Model.transform.TransformDirection(localOffset);
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

	public GetBlockBelowMeta(): BlockDef | undefined {
		return WorldAPI.GetMainWorld()?.GetBlockBelowMeta(this.Model.transform.position);
	}

	public GetBin(): Bin {
		return this.bin;
	}

	public GetAccessoryMeshes(slot: AccessorySlot): Renderer[] {
		return this.PushToArray(this.AccessoryBuilder.GetAccessoryMeshes(slot));
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
		const itemMeta = ItemUtil.GetItemDef(projectileItemType);
		const launcherItemMeta = launcherItemType ? ItemUtil.GetItemDef(launcherItemType) : undefined; // I kind of wish there was syntactic sugar for this lol

		if (!itemMeta.projectile) {
			return error("Tried to launch item that wasn't a projectile: " + projectileItemType);
		}
		let firstPerson = false;
		if (this.IsLocalCharacter()) {
			firstPerson = Dependency<LocalEntityController>().IsFirstPerson();
		}

		const [, id] = ItemUtil.GetItemTypeComponents(projectileItemType);
		const projectilePath = `@Easy/Core/Shared/Resources/Prefabs/Projectiles/Ammo/${string.lower(id)}.prefab`;
		const projectileLauncher = this.GameObject.GetComponent<ProjectileLauncher>();

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
