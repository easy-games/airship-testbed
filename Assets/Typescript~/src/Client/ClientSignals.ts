import { Entity } from "@Easy/Core/Shared/Entity/Entity";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { MatchState } from "./Match/MatchState";

export const ClientSignals = {
	MatchStart: new Signal<void>(),
	/** Fired when match state changes. */
	MatchStateChange: new Signal<{ newState: MatchState; oldState: MatchState }>(),
	PlayerEliminated: new Signal<{ player: Player }>(),
	SpectatorTargetChanged: new Signal<{ entity: Entity }>(),
};
