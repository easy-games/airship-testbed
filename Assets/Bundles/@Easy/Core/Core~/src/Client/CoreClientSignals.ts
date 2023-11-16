import { Entity } from "Shared/Entity/Entity";
import { GroundItem } from "Shared/GroundItem/GroundItem";
import { ItemType } from "Shared/Item/ItemType";
import { Player } from "Shared/Player/Player";
import { BeforeBlockPlacedSignal } from "Shared/Signals/BeforeBlockPlacedSignal";
import { ChangeTeamSignal } from "Shared/Team/TeamJoinSignal";
import { Signal } from "Shared/Util/Signal";
import { ProjectileCollideClientSignal } from "./Controllers/Damage/Projectile/ProjectileCollideClientSignal";
import { ProjectileLaunchedClientSignal } from "./Controllers/Damage/Projectile/ProjectileLaunchedClientSignal";
import { BeforeBlockHitSignal } from "./Controllers/BlockInteractions/Signal/BeforeBlockHitSignal";
import { BlockPlaceClientSignal } from "./Signals/BlockPlaceClientSignal";
import { AfterBlockHitClientSignal } from "./Signals/AfterBlockHitClientSignal";
import { EntityDamageClientSignal } from "./Signals/EntityDamageClientSignal";
import { EntityDeathClientSignal } from "./Signals/EntityDeathClientSignal";
import { EntitySpawnClientSignal } from "./Signals/EntitySpawnClientEvent";
import { AbilityChargeClientSignal } from "./Controllers/Abilities/Event/AbilityChargeClientSignal";
import { AbilityChargeEndClientSignal } from "./Controllers/Abilities/Event/AbilityChargeEndClientSignal";
import { AbilityAddedClientSignal } from "./Controllers/Abilities/Event/AbilityAddedClientSignal";
import { AbilityRemovedClientSignal } from "./Controllers/Abilities/Event/AbilityRemovedClientSignal";
import { AbilitiesClearedClientSignal } from "./Controllers/Abilities/Event/AbilitiesClearedClientSignal";

export const CoreClientSignals = {
	EntitySpawn: new Signal<EntitySpawnClientSignal>(),
	EntityDamage: new Signal<EntityDamageClientSignal>(),
	EntityDeath: new Signal<EntityDeathClientSignal>(),
	EntityDespawn: new Signal<Entity>(),
	PlayerJoin: new Signal<Player>(),
	PlayerLeave: new Signal<Player>(),
	/** Fired before a block is hit. */
	BeforeBlockHit: new Signal<BeforeBlockHitSignal>(),
	AfterBlockHit: new Signal<AfterBlockHitClientSignal>(),

	/** Fired before a client-predicted block is placed. */
	BeforeBlockPlaced: new Signal<BeforeBlockPlacedSignal>(),
	/** Fired when a client-predicted block is placed. */
	BlockPlace: new Signal<BlockPlaceClientSignal>(),
	PlayerChangeTeam: new Signal<ChangeTeamSignal>(),
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

	AbilityAdded: new Signal<AbilityAddedClientSignal>(),
	AbilityRemoved: new Signal<AbilityRemovedClientSignal>(),
	AbilitiesCleared: new Signal<AbilitiesClearedClientSignal>(),

	AbilityChargeBegan: new Signal<AbilityChargeClientSignal>(),
	AbilityChargeEnded: new Signal<AbilityChargeEndClientSignal>(),
};
