import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { MatchState } from "Shared/Match/MatchState";
import { Network } from "Shared/Network";

@Controller({})
export class MatchController implements OnStart {
	/** Initial state is always `MatchState.SETUP. */
	private state: MatchState = MatchState.SETUP;

	OnStart(): void {
		/* Listen for match state change.  */
		Network.ServerToClient.MatchStateChange.Client.OnServerEvent((newState, oldState) => {
			this.state = newState;
			/* Fire signal. */
			ClientSignals.MatchStateChange.Fire({ newState: this.state, oldState: oldState });
		});
		/* Listen for match start. */
		Network.ServerToClient.MatchStarted.Client.OnServerEvent(() => {
			this.state = MatchState.RUNNING;
			/* Fire signal */
			ClientSignals.MatchStart.Fire();
		});
	}

	/**
	 * Returns current match state.
	 * @returns Current `MatchState`.
	 */
	public GetState(): MatchState {
		return this.state;
	}
}
