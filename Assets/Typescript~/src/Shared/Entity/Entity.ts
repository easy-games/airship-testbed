import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Global/Character/LocalEntityController";
import { EntityController } from "Client/Controllers/Global/Entity/EntityController";
import { PlayerController } from "Client/Controllers/Global/Player/PlayerController";
import { EntityService } from "Server/Services/Global/Entity/EntityService";
import { PlayerService } from "Server/Services/Global/Player/PlayerService";
import { GameObjectUtil } from "Shared/GameObjectBridge";
import { ItemType } from "Shared/Item/ItemType";
import { Network } from "Shared/Network";
import { Player } from "Shared/Player/Player";
import { Projectile } from "Shared/Projectile/Projectile";
import { ProgressBarGraphics } from "Shared/UI/ProgressBarGraphics";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal } from "Shared/Util/Signal";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { AudioManager } from "../Audio/AudioManager";
import { BlockMeta } from "../Item/ItemMeta";
import { ItemUtil } from "../Item/ItemUtil";
import { BundleReferenceManager } from "../Util/BundleReferenceManager";
import { BundleGroupNames, Bundle_Entity, Bundle_Entity_Movement } from "../Util/ReferenceManagerResources";
import { WorldAPI } from "../VoxelWorld/WorldAPI";
import { InventoryEntityAnimator, ItemPlayMode } from "./Animation/InventoryEntityAnimator";
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

export class EntityReferences {
	meshes: Array<Renderer>;
	fpsMesh: Renderer;
	neckBone: Transform;
	headBone: Transform;
	spineBone1: Transform;
	spineBone2: Transform;
	spineBone3: Transform;
	root: Transform;
	characterCollider: Collider;
	animationEvents: EntityAnimationEvents;
	jumpSound: AudioClip | undefined;
	slideSound: AudioClip | undefined;
	landSound: AudioClip | undefined;

	constructor(ref: GameObjectReferences) {
		let boneKey = "Bones";
		let meshKey = "Meshes";
		let colliderKey = "Colliders";
		let vfxKey = "VFX";

		//Get the meshes
		let meshesCS: CSArray<Renderer> = ref.GetAllValues<Renderer>(meshKey);
		this.meshes = table.create(meshesCS.Length);
		for (let i = 0; i < meshesCS.Length; i++) {
			this.meshes[i] = meshesCS.GetValue(i);
		}
		this.fpsMesh = ref.GetValue<Renderer>(meshKey, "FirstPerson");
		//Get the bones
		this.neckBone = ref.GetValue<Transform>(boneKey, "Neck");
		this.spineBone3 = ref.GetValue<Transform>(boneKey, "Spine3");
		this.spineBone2 = ref.GetValue<Transform>(boneKey, "Spine2");
		this.spineBone1 = ref.GetValue<Transform>(boneKey, "Spine1");
		this.headBone = ref.GetValue<Transform>(boneKey, "Head");
		this.root = ref.GetValue<Transform>(boneKey, "Root");

		this.characterCollider = ref.GetValue<Collider>(colliderKey, "CharacterController");

		this.animationEvents = ref.GetValue<EntityAnimationEvents>(vfxKey, "AnimationEvents");

		/*this.jumpSound = AudioManager.LoadFullPathAudioClip(BundleReferenceManager.GetPathForResource(
			BundleGroupNames.Entity,
			Bundle_Entity.Movement,
			Bundle_Entity_Movement.JumpSFX,
		));*/

		this.slideSound = AudioManager.LoadFullPathAudioClip(
			BundleReferenceManager.GetPathForResource(
				BundleGroupNames.Entity,
				Bundle_Entity.Movement,
				Bundle_Entity_Movement.SlideSFX,
			),
		);

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
	public anim?: InventoryEntityAnimator;
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
	private health = 100;
	private maxHealth = 100;
	private dead = false;
	private destroyed = false;
	private displayName: string;
	private healthbarEnabled = false;
	private healthbar?: ProgressBarGraphics;

	public readonly OnHealthChanged = new Signal<[newHealth: number, oldHealth: number]>();
	public readonly OnDespawn = new Signal<void>();
	public readonly OnPlayerChanged = new Signal<[newPlayer: Player | undefined, oldPlayer: Player | undefined]>();
	public readonly OnAdjustMove = new Signal<[moveModifier: MoveModifier]>();
	public readonly OnDisplayNameChanged = new Signal<[displayName: string]>();

	constructor(id: number, networkObject: NetworkObject, clientId: number | undefined) {
		this.id = id;
		this.gameObject = networkObject.gameObject;
		this.references = new EntityReferences(this.gameObject.GetComponent<GameObjectReferences>());
		this.model = this.references.root.gameObject;
		this.entityDriver = this.gameObject.GetComponent<EntityDriver>();
		this.networkObject = networkObject;
		this.anim = new InventoryEntityAnimator(this, this.model.GetComponent<AnimancerComponent>(), this.references);
		this.attributes = this.gameObject.GetComponent<EasyAttributes>();
		this.accessoryBuilder = this.gameObject.GetComponent<AccessoryBuilder>();
		this.ClientId = clientId;
		if (this.ClientId !== undefined) {
			if (RunUtil.IsServer()) {
				const player = Dependency<PlayerService>().GetPlayerFromClientId(this.ClientId);
				this.SetPlayer(player);
			} else {
				const player = Dependency<PlayerController>().GetPlayerFromClientId(this.ClientId);
				if (player) {
					print(`Found Player that controls this entity. (Player=${player.username}, Entity=${this.id})`);
				} else {
					print(`Entity is not controlled by any player. (Entity=${this.id})`);
				}
				this.SetPlayer(player);
			}
		}
		if (this.player) {
			this.displayName = this.player.username;
		} else {
			this.displayName = `entity_${this.id}`;
		}

		this.entityDriver.OnImpactWithGround((velocity) => {
			this.anim?.PlayFootstepSound();
		});

		this.entityDriver.OnAdjustMove((moveModifier) => {
			this.OnAdjustMove.Fire(moveModifier);
		});
	}

	public AddHealthbar(): void {
		if (RunUtil.IsServer()) {
			this.healthbarEnabled = true;
			Network.ServerToClient.Entity.AddHealthbar.Server.FireAllClients(this.id);
			return;
		}
		if (this.IsLocalCharacter()) return;

		const prefab = AssetBridge.LoadAsset<Object>("Client/Resources/Prefabs/EntityHealthbar.prefab");
		const healthbarGO = GameObjectUtil.InstantiateIn(prefab, this.model.transform);
		const transform = healthbarGO.transform;
		transform.localPosition = new Vector3(0, 2.2, 0);
		this.healthbar = new ProgressBarGraphics(transform.GetChild(0));

		this.healthbar.SetValue(this.health / this.maxHealth);
		this.healthbarEnabled = true;
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
			Network.ServerToClient.Entity.SetDisplayName.Server.FireAllClients(this.id, displayName);
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

	public SetHealth(health: number): void {
		health = math.clamp(health, 0, this.maxHealth);
		if (health === this.health) return;
		const oldHealth = this.health;
		this.health = health;
		this.OnHealthChanged.Fire(health, oldHealth);
		this.healthbar?.SetValue(this.health / this.maxHealth);

		if (RunUtil.IsServer()) {
			Network.ServerToClient.Entity.SetHealth.Server.FireAllClients(this.id, this.health);
		}
	}

	public SetMaxHealth(maxHealth: number): void {
		this.maxHealth = maxHealth;
	}

	/**
	 * It is recommended to use EntityService.DespawnEntity() instead of this.
	 */
	public Destroy(): void {
		this.OnDespawn.Fire();
		this.destroyed = true;

		delete this.anim;

		if (this.player) {
			this.player.SetCharacter(undefined);
		}

		if (RunUtil.IsServer()) {
			Network.ServerToClient.DespawnEntity.Server.FireAllClients(this.id);
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

	/*public PlayAnimation(
		animationId: EntityAnimationId,
		config?: {
			layer?: number;
			exceptClientId?: number;
		},
	) {
		if (RunUtil.IsServer()) {
			if (config?.exceptClientId !== undefined) {
				Network.ServerToClient.PlayEntityAnimation.Server.FireExcept(
					config.exceptClientId,
					this.Id,
					animationId,
					config?.layer,
				);
			} else {
				Network.ServerToClient.PlayEntityAnimation.Server.FireAllClients(this.Id, animationId, config?.layer);
			}
		}
		this.anim.PlayAnimation(animationId, config?.layer ?? 10);
	}*/

	public SendItemAnimationToClients(useIndex = 0, animationMode: ItemPlayMode = 0, exceptClientId?: number) {
		if (RunUtil.IsServer()) {
			if (exceptClientId !== undefined) {
				Network.ServerToClient.PlayEntityItemAnimation.Server.FireExcept(
					exceptClientId,
					this.id,
					useIndex,
					animationMode,
				);
			} else {
				Network.ServerToClient.PlayEntityItemAnimation.Server.FireAllClients(this.id, useIndex, animationMode);
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
		return this.GetEntityDriver().GetState();
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
	}

	public IsDead(): boolean {
		return this.dead;
	}

	public GetBlockBelowMeta(): BlockMeta | undefined {
		return WorldAPI.GetMainWorld().GetBlockBelowMeta(this.model.transform.position);
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

	public LaunchProjectile(itemType: ItemType, launchPos: Vector3, velocity: Vector3): EasyProjectile | undefined {
		const itemMeta = ItemUtil.GetItemMeta(itemType);
		if (!itemMeta.Ammo) {
			return error("Tried to launch item that wasn't a projectile: " + itemType);
		}
		let firstPerson = false;
		if (this.IsLocalCharacter()) {
			firstPerson = Dependency<LocalEntityController>().IsFirstPerson();
		}
		const projectilePath = `Shared/Resources/Prefabs/Projectiles/Ammo/${itemType}.prefab`;
		const projectileLauncher = this.gameObject.GetComponent<ProjectileLauncher>();

		const easyProjectile = projectileLauncher.ClientFire(
			projectilePath,
			itemMeta.ID,
			launchPos,
			velocity,
			itemMeta.Ammo.gravity,
			0,
		);
		const projectile = new Projectile(easyProjectile, itemType, this);

		if (RunUtil.IsClient()) {
			const clientSignals = import("Client/ClientSignals").expect().ClientSignals;
			const ProjectileLaunchedClientSignal = import(
				"Client/Controllers/Global/Damage/Projectile/ProjectileLaunchedClientSignal"
			).expect().ProjectileLaunchedClientSignal;

			clientSignals.ProjectileLaunched.Fire(new ProjectileLaunchedClientSignal(projectile));
		}
	}

	public HasHealthbar(): boolean {
		return this.healthbarEnabled;
	}
}
