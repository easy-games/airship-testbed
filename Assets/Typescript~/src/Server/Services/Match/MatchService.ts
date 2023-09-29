import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { PlayerService } from "Imports/Core/Server/Services/Player/PlayerService";
import { Team } from "Imports/Core/Shared/Team/Team";
import { Task } from "Imports/Core/Shared/Util/Task";
import { TimeUtil } from "Imports/Core/Shared/Util/TimeUtil";
import { ServerSignals } from "Server/ServerSignals";
import { MatchStartServerEvent } from "Server/Signals/MatchStartServerEvent";
import { MatchState } from "Shared/Match/MatchState";
import { Network } from "Shared/Network";
import { Queues } from "Shared/Queue/QueueDefinitions";
import { QueueMeta } from "Shared/Queue/QueueMeta";
import { QueueType } from "Shared/Queue/QueueType";
import { MapService } from "./Map/MapService";

@Service({})
export class MatchService implements OnStart {
	/** Initial state is always `MatchState.SETUP. */
	private state: MatchState = MatchState.SETUP;
	/** Match queue type. */
	private queueType: QueueType;
	private matchStartTime = TimeUtil.GetServerTime();

	constructor() {
		/* Load queue type from server bootstrap. */
		const serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>();
		const q = serverBootstrap.GetQueueType();
		/* If queue type does not exist, kill thread. */
		if (!Object.values(QueueType).includes(q as unknown as QueueType)) {
			print("[FATAL]: Invalid queue type: " + q);
			error();
		}
		this.queueType = q as unknown as QueueType;
	}

	OnStart(): void {
		const loadedMap = Dependency<MapService>().WaitForMapLoaded();
		/* Immediately transition into `MatchState.PRE` after map load. */
		this.SetState(MatchState.PRE);

		Dependency<PlayerService>().ObservePlayers((p) => {
			Network.ServerToClient.MatchInfo.Server.FireClient(p.clientId, {
				mapName: loadedMap.displayName,
				mapAuthors: loadedMap.authors,
				matchStartTime:
					this.state === MatchState.RUNNING || this.state === MatchState.POST
						? this.matchStartTime
						: undefined,
				matchState: this.state,
			});
		});
	}

	/** Yields until match exits `MatchState.SETUP` state. */
	public WaitForMatchReady(): void {
		if (this.state !== MatchState.SETUP) return;
		while (this.state === MatchState.SETUP) {
			Task.Wait(0.1);
		}
	}

	/** Yields until queue data exists. */
	public WaitForQueueReady(): QueueMeta {
		if (this.queueType) return this.GetQueueMeta();
		while (!this.queueType) {
			Task.Wait(0.1);
		}
		return this.GetQueueMeta();
	}

	/**
	 * Returns current match state.
	 * @returns Current `MatchState`.
	 */
	public GetState(): MatchState {
		return this.state;
	}

	public IsRunning(): boolean {
		return this.state === MatchState.RUNNING;
	}

	/** Starts current match.*/
	public StartMatch(): void {
		if (this.state !== MatchState.PRE) return;
		this.matchStartTime = TimeUtil.GetServerTime();
		this.SetState(MatchState.RUNNING);
		/* Fire signal and remote. */
		ServerSignals.MatchStart.Fire(new MatchStartServerEvent());
		Network.ServerToClient.MatchStarted.Server.FireAllClients();
	}

	/** Ends current match. Optionally accepts a winning team. */
	public EndMatch(winningTeam?: Team): void {
		if (this.state !== MatchState.RUNNING) return;
		this.SetState(MatchState.POST);
		/* Fire signal and remote. */
		ServerSignals.MatchEnded.Fire({ winningTeam });
		Network.ServerToClient.MatchEnded.Server.FireAllClients(winningTeam?.id);
	}

	/** Sets match state. */
	private SetState(state: MatchState) {
		const oldState = this.state;
		this.state = state;
		/* Fire signal and remote. */
		ServerSignals.MatchStateChange.Fire({ newState: this.state, oldState: oldState });
		Network.ServerToClient.MatchStateChange.Server.FireAllClients(this.state, oldState);
	}

	/**
	 * Fetch queue type for current match.
	 * @returns Queue type for current match.
	 */
	public GetQueueType(): QueueType {
		return this.queueType;
	}

	/**
	 * Fetch queue meta for current match.
	 * @returns Current match queue meta.
	 */
	public GetQueueMeta(): QueueMeta {
		return Queues[this.queueType];
	}
}
