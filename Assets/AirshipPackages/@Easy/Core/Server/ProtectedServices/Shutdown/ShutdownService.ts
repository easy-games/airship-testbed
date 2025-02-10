import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";

@Service({})
export class ShutdownService {
	private playerConnected = false;
	private timeWithNoPlayers = 0;

	private static shutdownTimeNobodyConnected = 3 * 60;
	private static shutdownTimeAllPlayersLeft = 1 * 60;

	private fireOnShutdownStarted = false;

	private serverBootstrap: ServerBootstrap;

	constructor() {
		this.serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>()!;
	}

	protected OnStart(): void {
		// Airship.players.onPlayerJoined.Connect((player) => {
		// 	this.playerConnected = true;
		// 	this.timeWithNoPlayers = 0;
		// });

		this.serverBootstrap.onProcessExit(() => {
			this.FireOnShutdown();
		});

		const intervalTime = 10;
		SetInterval(intervalTime, () => {
			if (Game.IsEditor()) {
				return;
			}

			const players = PlayerManagerBridge.Instance.GetPlayers();
			const playerCount = players.size();

			if (playerCount > 0) {
				this.playerConnected = true;
				this.timeWithNoPlayers = 0;
			}
			if (playerCount === 0) {
				this.timeWithNoPlayers += intervalTime;

				if (this.playerConnected) {
					if (this.timeWithNoPlayers >= ShutdownService.shutdownTimeAllPlayersLeft) {
						print("Server will shutdown due to excessive time with all players having left.");
						this.Shutdown();
					}
				} else {
					if (this.timeWithNoPlayers >= ShutdownService.shutdownTimeNobodyConnected) {
						print("Server will shutdown due to excessive time with nobody ever connecting.");
						this.Shutdown();
					}
				}
			}
		});
	}

	public Shutdown(): void {
		this.FireOnShutdown();
	}

	private FireOnShutdown(): void {
		if (this.fireOnShutdownStarted) return;
		this.fireOnShutdownStarted = true;
		print("FireOnShutdown");
		let done = false;

		const Done = () => {
			if (done) return;
			done = true;

			this.serverBootstrap.Shutdown();
		};

		// We allow up to 30 minutes for servers to finish up matches / handle shutdown messages. Set a timer for 30 minutes + 10 seconds to shutdown the server if it isn't already
		task.unscaledDelay(30 * 60 + 15, () => {
			Done();
		});
		task.spawn(() => {
			contextbridge.invoke("ServerShutdown", LuauContext.Game);
			Done();
		});
	}
}
