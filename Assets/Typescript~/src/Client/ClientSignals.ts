import { Entity } from "@Easy/Core/Shared/Entity/Entity";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { MatchState } from "./Match/MatchState";
import { StatusEffectType } from "./StatusEffect/StatusEffectType";

export const ClientSignals = {
	/** Fired when match starts. */
	MatchStart: new Signal<void>(),
	/** Fired when match state changes. */
	MatchStateChange: new Signal<{ newState: MatchState; oldState: MatchState }>(),
	/** Fired when a player is eliminated in BedWars. */
	PlayerEliminated: new Signal<{ player: Player }>(),
	/** Fired when spectator target changes. */
	SpectatorTargetChanged: new Signal<{ entity: Entity }>(),
	/** Fired when a status effect is added to a player. */
	StatusEffectAdded: new Signal<[clientId: number, statusEffectType: StatusEffectType, tier: number]>(),
	/** Fired when a status effect is removed from a player. */
	StatusEffectRemoved: new Signal<[clientId: number, statusEffectType: StatusEffectType]>(),
};
