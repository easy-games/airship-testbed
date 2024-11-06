import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";

@Service({})
export class ShutdownService {
	private playerConnected = false;
	private timeWithNoPlayers = 0;

	private static shutdownTimeNobodyConnected = 3 * 60;
	private static shutdownTimeAllPlayersLeft = 1 * 60;

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
			let playerCount = players.Length;

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
		const serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>()!;
		serverBootstrap.Shutdown();
	}

	private FireOnShutdown(): void {
		print("FireOnShutdown");
		let done = false;

		const Done = () => {
			if (done) return;
			done = true;

			this.serverBootstrap.Shutdown();
		};

		task.unscaledDelay(30, () => {
			Done();
		});
		task.spawn(() => {
			contextbridge.invoke("ServerShutdown", LuauContext.Game);
			Done();
		});
	}
}
