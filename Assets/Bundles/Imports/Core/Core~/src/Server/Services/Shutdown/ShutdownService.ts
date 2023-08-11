import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { RunUtil } from "Shared/Util/RunUtil";
import { SetInterval } from "Shared/Util/Timer";
import { PlayerService } from "../Player/PlayerService";

@Service({})
export class ShutdownService implements OnStart {
	private playerConnected = false;
	private timeWithNoPlayers = 0;

	private static SHUTDOWN_TIME_NOBODY_CONNECTED = 10 * 60;
	private static SHUTDOWN_TIME_ALL_PLAYERS_LEFT = 1 * 60;

	constructor(private readonly playerService: PlayerService) {}

	OnStart(): void {
		ServerSignals.PlayerJoin.Connect((event) => {
			this.playerConnected = true;
			this.timeWithNoPlayers = 0;
		});

		const intervalTime = 10;
		SetInterval(intervalTime, () => {
			if (this.playerService.GetPlayers().size() === 0) {
				this.timeWithNoPlayers += intervalTime;

				if (RunUtil.IsEditor()) {
					return;
				}

				if (this.playerConnected) {
					if (this.timeWithNoPlayers >= ShutdownService.SHUTDOWN_TIME_ALL_PLAYERS_LEFT) {
						print("Server will shutdown due to excessive time with all players having left.");
						this.Shutdown();
					}
				} else {
					if (this.timeWithNoPlayers >= ShutdownService.SHUTDOWN_TIME_NOBODY_CONNECTED) {
						print("Server will shutdown due to excessive time with nobody ever connecting.");
						this.Shutdown();
					}
				}
			}
		});
	}

	public Shutdown(): void {
		const serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>();
		serverBootstrap.Shutdown();
	}
}
