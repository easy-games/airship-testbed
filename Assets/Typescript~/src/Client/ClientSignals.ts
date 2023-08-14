import { BeforeBlockHitSignal } from "Imports/Core/Client/Controllers/BlockInteractions/Signal/BeforeBlockHitSignal";
import { ProjectileCollideClientSignal } from "Imports/Core/Client/Controllers/Damage/Projectile/ProjectileCollideClientSignal";
import { ProjectileLaunchedClientSignal } from "Imports/Core/Client/Controllers/Damage/Projectile/ProjectileLaunchedClientSignal";
import { EntitySpawnClientSignal } from "Imports/Core/Client/Signals/EntitySpawnClientEvent";
import { Entity } from "Imports/Core/Shared/Entity/Entity";
import { GroundItem } from "Imports/Core/Shared/GroundItem/GroundItem";
import { ItemType } from "Imports/Core/Shared/Item/ItemType";
import { Player } from "Imports/Core/Shared/Player/Player";
import { BeforeBlockPlacedSignal } from "Imports/Core/Shared/Signals/BeforeBlockPlacedSignal";
import { ChangeTeamSignal } from "Imports/Core/Shared/Team/TeamJoinSignal";
import { Signal } from "Imports/Core/Shared/Util/Signal";
import { MatchState } from "./Match/MatchState";
import { BlockPlaceClientSignal } from "./Signals/BlockPlaceClientSignal";
import { EntityDamageClientSignal } from "./Signals/EntityDamageClientSignal";
import { EntityDeathClientSignal } from "./Signals/EntityDeathClientSignal";

export const ClientSignals = {
	EntitySpawn: new Signal<EntitySpawnClientSignal>(),
	EntityDamage: new Signal<EntityDamageClientSignal>(),
	EntityDeath: new Signal<EntityDeathClientSignal>(),
	EntityDespawn: new Signal<Entity>(),
	PlayerJoin: new Signal<Player>(),
	PlayerLeave: new Signal<Player>(),
	/** Fired before a block is hit. */
	BeforeBlockHit: new Signal<BeforeBlockHitSignal>(),

	AfterBlockHit: new Signal<{ pos: Vector3; blockId: number; entity?: Entity }>(),

	/** Fired before a client-predicted block is placed. */
	BeforeBlockPlaced: new Signal<BeforeBlockPlacedSignal>(),
	/** Fired when a client-predicted block is placed. */
	BlockPlace: new Signal<BlockPlaceClientSignal>(),
	/** Fired when a tag is added to a `GameObject` on the _client_. */
	CollectionManagerTagAdded: new Signal<{ go: GameObject; tag: string }>(),
	/** Fired when a `GameObject` is added to a collection on the _client_. */
	GameObjectAddedToCollection: new Signal<{ go: GameObject; tag: string }>(),
	PlayerChangeTeam: new Signal<ChangeTeamSignal>(),
	/** Fired when match enters `MatchState.RUNNING`. */
	MatchStart: new Signal<void>(),
	/** Fired when match state changes. */
	MatchStateChange: new Signal<{ newState: MatchState; oldState: MatchState }>(),
	/** Fired when local player swings melee weapon. */
	WeaponSwing: new Signal<{ weapon: ItemType }>(),
	/** Fired when local player's melee weapon hits. */
	WeaponHit: new Signal<{ weapon: ItemType; hitEntity: Entity }>(),
	/** Fired when local player fires a projectile. */
	ProjectileLaunched: new Signal<ProjectileLaunchedClientSignal>(),
	ProjectileCollide: new Signal<ProjectileCollideClientSignal>(),
	/** Fired when a player is eliminated. */
	PlayerEliminated: new Signal<{ player: Player }>(),
	SpectatorTargetChanged: new Signal<{ entity: Entity }>(),
	EntityPickupItem: new Signal<{ entity: Entity; groundItem: GroundItem }>(),
};
