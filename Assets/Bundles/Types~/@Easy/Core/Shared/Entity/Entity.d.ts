/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/compiler-types" />
import { BlockDef } from "../Item/ItemDefinitionTypes";
import { ItemType } from "../Item/ItemType";
import { Player } from "../Player/Player";
import { Team } from "../Team/Team";
import { Healthbar } from "../UI/Healthbar";
import { Bin } from "../Util/Bin";
import { Signal } from "../Util/Signal";
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
export declare class EntityReferences {
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
    animationHelper: CharacterAnimationHelper;
    jumpSound: AudioClip | undefined;
    slideSoundPaths: Array<string>;
    landSound: AudioClip | undefined;
    footstepAudioSource: AudioSource;
    constructor(ref: GameObjectReferences);
}
export declare class Entity {
    /** Entity's unique id. */
    readonly id: number;
    readonly gameObject: GameObject;
    readonly networkObject: NetworkObject;
    readonly entityDriver: EntityDriver;
    readonly model: GameObject;
    readonly attributes: EasyAttributes;
    animator: CharacterEntityAnimator;
    readonly references: EntityReferences;
    readonly accessoryBuilder: AccessoryBuilder;
    player: Player | undefined;
    /**
     * The connection ID of whoever is controlling this entity.
     * Only exists if this entity is attached to a player.
     *
     * **This should NOT be used to uniquely identify an entity.**
     */
    readonly clientId?: number;
    protected health: number;
    protected maxHealth: number;
    protected moveDirection: Vector3;
    protected dead: boolean;
    protected destroyed: boolean;
    protected displayName: string;
    protected healthbarEnabled: boolean;
    protected healthbar?: Healthbar;
    protected state: EntityState;
    protected bin: Bin;
    readonly onHealthChanged: Signal<[newHealth: number, oldHealth: number]>;
    readonly onDespawn: Signal<void>;
    readonly onPlayerChanged: Signal<[newPlayer: Player | undefined, oldPlayer: Player | undefined]>;
    readonly onAdjustMove: Signal<[moveModifier: MoveModifier]>;
    readonly onMoveDirectionChanged: Signal<[moveDirection: Vector3]>;
    readonly onDisplayNameChanged: Signal<[displayName: string]>;
    readonly onStateChanged: Signal<[state: EntityState, oldState: EntityState]>;
    readonly onDeath: Signal<void>;
    readonly onArmorChanged: Signal<number>;
    constructor(id: number, networkObject: NetworkObject, clientId: number | undefined);
    Teleport(pos: Vector3, lookVector?: Vector3): void;
    IsHeadshotHitHeight(height: number): boolean;
    IsCrouched(): boolean;
    AddHealthbar(): void;
    /**
     * Gets the current position of this entity
     * @returns
     */
    GetPosition(): Vector3;
    GetHealthbar(): Healthbar | undefined;
    GetTeam(): Team | undefined;
    CanDamage(entity: Entity): boolean;
    SetPlayer(player: Player | undefined): void;
    SetDisplayName(displayName: string): void;
    GetHealth(): number;
    GetMaxHealth(): number;
    GetEntityDriver(): EntityDriver;
    GetMoveDirection(): Vector3;
    SetHealth(health: number): void;
    SetMaxHealth(maxHealth: number): void;
    /**
     * It is recommended to use EntityService.DespawnEntity() instead of this.
     */
    Destroy(): void;
    IsDestroyed(): boolean;
    Encode(): EntityDto;
    IsPlayerOwned(): boolean;
    IsLocalCharacter(): boolean;
    IsAlive(): boolean;
    static FindById(id: number): Entity | undefined;
    static WaitForId(id: number): Promise<Entity | undefined>;
    static FindByClientId(id: number): Entity | undefined;
    static FindByCollider(collider: Collider): Entity | undefined;
    static FindByGameObject(gameObject: GameObject): Entity | undefined;
    SendItemAnimationToClients(useIndex?: number, animationMode?: ItemPlayMode, exceptClientId?: number): void;
    HasImmunity(): boolean;
    GetImmuneUntilTime(): number;
    GetLastDamagedTime(): number;
    TimeSinceLastDamaged(): number;
    SetLastDamagedTime(time: number): void;
    GrantImmunity(duration: number): void;
    GetState(): EntityState;
    GetCenterOfMass(): Vector3;
    GetHeadPosition(): Vector3;
    GetHeadOffset(): Vector3;
    GetFirstPersonHeadOffset(): Vector3;
    GetMiddlePosition(): Vector3;
    LocalOffsetToWorldPoint(localOffset: Vector3): Vector3;
    GetDisplayName(): string;
    Kill(): void;
    IsDead(): boolean;
    GetBlockBelowMeta(): BlockDef | undefined;
    GetBin(): Bin;
    GetAccessoryMeshes(slot: AccessorySlot): Renderer[];
    private PushToArray;
    LaunchProjectile(launcherItemType: ItemType | undefined, projectileItemType: ItemType, launchPos: Vector3, velocity: Vector3): AirshipProjectile | undefined;
    GetArmor(): number;
    HasHealthbar(): boolean;
}
