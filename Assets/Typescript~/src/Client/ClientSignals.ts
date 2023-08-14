import { Entity } from "Imports/Core/Shared/Entity/Entity";
import { Player } from "Imports/Core/Shared/Player/Player";
import { Signal } from "Imports/Core/Shared/Util/Signal";
import { MatchState } from "./Match/MatchState";

export const ClientSignals = {
	MatchStart: new Signal<void>(),
	/** Fired when match state changes. */
	MatchStateChange: new Signal<{ newState: MatchState; oldState: MatchState }>(),
	PlayerEliminated: new Signal<{ player: Player }>(),
	SpectatorTargetChanged: new Signal<{ entity: Entity }>(),
};
