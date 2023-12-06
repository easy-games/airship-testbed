import { Entity } from "Shared/Entity/Entity";
import { GroundItem } from "Shared/GroundItem/GroundItem";
import { ItemType } from "Shared/Item/ItemType";
import { Player } from "Shared/Player/Player";
import { BeforeBlockPlacedSignal } from "Shared/Signals/BeforeBlockPlacedSignal";
import { ChangeTeamSignal } from "Shared/Team/TeamJoinSignal";
import { Signal } from "Shared/Util/Signal";
import { AbilitiesClearedClientSignal } from "./Controllers/Abilities/Event/AbilitiesClearedClientSignal";
import { AbilityAddedClientSignal } from "./Controllers/Abilities/Event/AbilityAddedClientSignal";
import { AbilityChargeClientSignal } from "./Controllers/Abilities/Event/AbilityChargeClientSignal";
import { AbilityChargeEndClientSignal } from "./Controllers/Abilities/Event/AbilityChargeEndClientSignal";
import { AbilityRemovedClientSignal } from "./Controllers/Abilities/Event/AbilityRemovedClientSignal";
import { AbilityStateUpdateSignal } from "./Controllers/Abilities/Event/AbilityStateUpdateSignal";
import { BeforeBlockHitSignal } from "./Controllers/BlockInteractions/Signal/BeforeBlockHitSignal";
import { ProjectileCollideClientSignal } from "./Controllers/Damage/Projectile/ProjectileCollideClientSignal";
import { ProjectileLaunchedClientSignal } from "./Controllers/Damage/Projectile/ProjectileLaunchedClientSignal";
import { AfterBlockHitClientSignal } from "./Signals/AfterBlockHitClientSignal";
import { BlockPlaceClientSignal } from "./Signals/BlockPlaceClientSignal";
import { EntityDamageClientSignal } from "./Signals/EntityDamageClientSignal";
import { EntityDeathClientSignal } from "./Signals/EntityDeathClientSignal";
import { EntitySpawnClientSignal } from "./Signals/EntitySpawnClientEvent";

export const CoreClientSignals = {
	EntitySpawn: new Signal<EntitySpawnClientSignal>(),
	EntityDamage: new Signal<EntityDamageClientSignal>(),
	EntityDeath: new Signal<EntityDeathClientSignal>(),
	EntityDespawn: new Signal<Entity>(),
	PlayerJoin: new Signal<Player>(),
	PlayerLeave: new Signal<Player>(),
	/**
	 * Fired before a block is hit.
	 *
	 * **This is only fired when the local client hits a block.** Remote clients hitting blocks will not fire this signal.
	 * */
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
	AbilityStateUpdate: new Signal<AbilityStateUpdateSignal>(),
	AbilitiesCleared: new Signal<AbilitiesClearedClientSignal>(),

	AbilityChargeBegan: new Signal<AbilityChargeClientSignal>(),
	AbilityChargeEnded: new Signal<AbilityChargeEndClientSignal>(),

	// ----- REFACTORING -----
	LocalAbilityActivateRequest: new Signal<{ abilityId: string }>(),
	AbilityAddedNew: new Signal<{ clientId: number; abilityId: string }>(),
	AbilityRemovedNew: new Signal<{ clientId: number; abilityId: string }>(),
	AbilityUsedNew: new Signal<{ clientId: number; abilityId: string }>(),
	AbilityEnabled: new Signal<{ clientId: number; abilityId: string }>(),
	AbilityDisabled: new Signal<{ clientId: number; abilityId: string }>(),
};
