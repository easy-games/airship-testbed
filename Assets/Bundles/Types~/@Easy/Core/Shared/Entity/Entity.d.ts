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
    SlideSoundPaths: Array<string>;
    LandSound: AudioClip | undefined;
    FootstepAudioSource: AudioSource;
    constructor(ref: GameObjectReferences);
}
export declare class Entity {
    /** Entity's unique id. */
    readonly Id: number;
    readonly GameObject: GameObject;
    readonly NetworkObject: NetworkObject;
    readonly EntityDriver: EntityDriver;
    readonly Model: GameObject;
    readonly Attributes: EasyAttributes;
    Animator: CharacterEntityAnimator;
    readonly References: EntityReferences;
    readonly AccessoryBuilder: AccessoryBuilder;
    Player: Player | undefined;
    /**
     * The connection ID of whoever is controlling this entity.
     * Only exists if this entity is attached to a player.
     *
     * **This should NOT be used to uniquely identify an entity.**
     */
    readonly ClientId?: number;
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
    readonly OnHealthChanged: Signal<[newHealth: number, oldHealth: number]>;
    readonly OnDespawn: Signal<void>;
    readonly OnPlayerChanged: Signal<[newPlayer: Player | undefined, oldPlayer: Player | undefined]>;
    readonly OnAdjustMove: Signal<[moveModifier: MoveModifier]>;
    readonly OnMoveDirectionChanged: Signal<[moveDirection: Vector3]>;
    readonly OnDisplayNameChanged: Signal<[displayName: string]>;
    readonly OnStateChanged: Signal<[state: EntityState, oldState: EntityState]>;
    readonly OnDeath: Signal<void>;
    readonly OnArmorChanged: Signal<number>;
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
