import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";

@Service({})
export class ShutdownService implements OnStart {
	private playerConnected = false;
	private timeWithNoPlayers = 0;

	private static shutdownTimeNobodyConnected = 10 * 60;
	private static shutdownTimeAllPlayersLeft = 1 * 60;

	constructor() {}

	OnStart(): void {
		// Airship.players.onPlayerJoined.Connect((player) => {
		// 	this.playerConnected = true;
		// 	this.timeWithNoPlayers = 0;
		// });

		const intervalTime = 10;
		SetInterval(intervalTime, () => {
			if (Game.IsEditor()) {
				return;
			}

			let playerCount = 0;
			const players = PlayerManagerBridge.Instance.GetPlayers();
			// filter bots
			for (let i = 0; i < players.Length; i++) {
				const p = players.GetValue(i);
				if (p.clientId >= 0) {
					playerCount++;
				}
			}
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
}
