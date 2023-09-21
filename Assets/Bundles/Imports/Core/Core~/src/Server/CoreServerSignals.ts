import { Entity } from "Shared/Entity/Entity";
import { GroundItem } from "Shared/GroundItem/GroundItem";
import { ItemType } from "Shared/Item/ItemType";
import { Player } from "Shared/Player/Player";
import { BeforeBlockPlacedSignal } from "Shared/Signals/BeforeBlockPlacedSignal";
import { BlockGroupPlaceSignal, BlockPlaceSignal } from "Shared/Signals/BlockPlaceSignal";
import { ChangeTeamSignal } from "Shared/Team/TeamJoinSignal";
import { Signal } from "Shared/Util/Signal";
import { BeforeBlockGroupHitSignal, BeforeBlockHitSignal } from "./Services/Block/Signal/BeforeBlockHitSignal";
import { ProjectileCollideServerSignal } from "./Services/Damage/Projectile/ProjectileCollideServerSignal";
import { BeforeEntityDropItemSignal } from "./Signals/BeforeEntityDropItemSignal";
import { BeforeEntitySpawnServerEvent } from "./Signals/BeforeEntitySpawnServerEvent";
import { EntityDamageServerSignal } from "./Signals/EntityDamageServerSignal";
import { EntityDeathServerSignal } from "./Signals/EntityDeathServerSignal";
import { EntityDropItemSignal } from "./Signals/EntityDropItemSignal";
import { EntitySpawnEvent } from "./Signals/EntitySpawnServerEvent";
import { MoveCommandDataEvent } from "./Signals/MoveCommandDataEvent";
import { PlayerJoinServerEvent } from "./Signals/PlayerJoinServerEvent";
import { PlayerLeaveServerEvent } from "./Signals/PlayerLeaveServerEvent";

export type BlockHitSignal = { blockId: number; blockPos: Vector3; readonly player: Player };
export type BlockGroupHitSignal = { blockIds: number[]; blockPositions: Vector3[]; readonly player: Player };

export const CoreServerSignals = {
	PlayerJoin: new Signal<PlayerJoinServerEvent>(),
	PlayerLeave: new Signal<PlayerLeaveServerEvent>(),
	EntityDamage: new Signal<EntityDamageServerSignal>(),
	EntityDeath: new Signal<EntityDeathServerSignal>(),
	EntityDespawn: new Signal<Entity>(),
	BeforeBlockPlaced: new Signal<BeforeBlockPlacedSignal>(),
	BlockPlace: new Signal<BlockPlaceSignal>(),
	BlockGroupPlace: new Signal<BlockGroupPlaceSignal>(),
	/** Fired **before** a block is hit. This signal is cancellable. */
	BeforeBlockHit: new Signal<BeforeBlockHitSignal>(),
	BeforeBlockGroupHit: new Signal<BeforeBlockGroupHitSignal>(),
	BlockHit: new Signal<BlockHitSignal>(),
	BlockGroupHit: new Signal<BlockGroupHitSignal>(),
	/** Fired before a block is destroyed. */
	BeforeBlockDestroyed: new Signal<{
		blockPos: Vector3;
		blockId: number;
		entity?: Entity;
	}>(),
	BeforeBlockGroupDestroyed: new Signal<{
		blockPositions: Vector3[];
		blockIds: number[];
		entity?: Entity;
	}>(),
	/** Fired when a block is destroyed. */
	BlockDestroyed: new Signal<{ blockPos: Vector3; blockId: number }>(),
	BlockGroupDestroyed: new Signal<{ blockPositions: Vector3[]; blockIds: number[] }>(),
	BeforeEntitySpawn: new Signal<BeforeEntitySpawnServerEvent>(),
	EntitySpawn: new Signal<EntitySpawnEvent>(),
	BeforeEntityDropItem: new Signal<BeforeEntityDropItemSignal>(),
	EntityDropItem: new Signal<EntityDropItemSignal>(),
	PlayerChangeTeam: new Signal<ChangeTeamSignal>(),
	/** Fired when a melee weapon is swung. */
	WeaponSwing: new Signal<{ weapon: ItemType; swingEntity: Entity }>(),
	/** Fired when a melee weapon hits. */
	WeaponHit: new Signal<{ weapon: ItemType; swingEntity: Entity; hitEntity: Entity; damage: number }>(),
	/** Fired when a projectile is fired. */
	ProjectileFired: new Signal<{ shooter: Entity; launcherItemType: ItemType; ammoItemType: ItemType }>(),
	/** Fired when projectile hits an object. */
	ProjectileHit: new Signal<ProjectileCollideServerSignal>(),
	CustomMoveCommand: new Signal<MoveCommandDataEvent>(),
	EntityPickupItem: new Signal<{ entity: Entity; groundItem: GroundItem }>(),
};
