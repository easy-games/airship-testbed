import { Airship } from "Shared/Airship";
import { OnStart, Service } from "Shared/Flamework";
import { RunUtil } from "Shared/Util/RunUtil";
import { SetInterval } from "Shared/Util/Timer";

@Service({})
export class ShutdownService implements OnStart {
	private playerConnected = false;
	private timeWithNoPlayers = 0;

	private static shutdownTimeNobodyConnected = 10 * 60;
	private static shutdownTimeAllPlayersLeft = 1 * 60;

	constructor() {}

	OnStart(): void {
		print("ShutdownService " + contextbridge.current());
		Airship.players.onPlayerJoined.Connect((player) => {
			this.playerConnected = true;
			this.timeWithNoPlayers = 0;
		});

		const intervalTime = 10;
		SetInterval(intervalTime, () => {
			let realPlayerCount = Airship.players
				.GetPlayers()
				.filter((p) => !p.IsBot())
				.size();
			if (realPlayerCount === 0) {
				this.timeWithNoPlayers += intervalTime;

				if (RunUtil.IsEditor()) {
					return;
				}

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
