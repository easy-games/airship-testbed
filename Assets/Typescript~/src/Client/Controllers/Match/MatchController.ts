import { TabListController } from "@Easy/Core/Client/Controllers/TabList/TabListController";
import { FriendsController } from "@Easy/Core/Client/MainMenuControllers/Social/FriendsController";
import { Game } from "@Easy/Core/Shared/Game";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import { TimeUtil } from "@Easy/Core/Shared/Util/TimeUtil";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";
import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { MatchInfoDto } from "Shared/Match/MatchInfoDto";
import { MatchState } from "Shared/Match/MatchState";
import { Network } from "Shared/Network";

@Controller({})
export class MatchController implements OnStart {
	/** Initial state is always `MatchState.SETUP. */
	private state: MatchState = MatchState.SETUP;
	public MatchStartTime: number | undefined;
	public MatchInfo: MatchInfoDto | undefined;
	public Eliminated = false;
	public OnEliminated = new Signal<void>();

	constructor(private readonly tablistController: TabListController) {
		Network.ServerToClient.MatchInfo.Client.OnServerEvent((matchInfoDto) => {
			this.MatchInfo = matchInfoDto;
			this.state = matchInfoDto.matchState;
			if (matchInfoDto.matchStartTime !== undefined) {
				this.MatchStartTime = matchInfoDto.matchStartTime;
			}
		});
		Network.ServerToClient.PlayerEliminated.Client.OnServerEvent((clientId) => {
			if (clientId === Game.LocalPlayer.clientId) {
				this.Eliminated = true;
				this.OnEliminated.Fire();
			}
		});
	}

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
			this.MatchStartTime = TimeUtil.GetServerTime();
			/* Fire signal */
			ClientSignals.MatchStart.Fire();
		});

		let timer = 0;
		if (this.MatchStartTime !== undefined) {
			timer = math.floor(this.MatchStartTime - TimeUtil.GetServerTime());
		}
		SetInterval(
			1,
			() => {
				if (this.state === MatchState.RUNNING) {
					timer++;
				}

				let minutes = math.floor(timer / 60);
				let seconds = math.floor(timer % 60);

				let time = string.format("%02d:%02d", minutes, seconds);

				let map = "";
				if (this.MatchInfo) {
					map =
						ColorUtil.ColoredText(Theme.Aqua, "<b>" + this.MatchInfo.mapName + "</b>") +
						ColorUtil.ColoredText(Theme.Gray, " by ") +
						ColorUtil.ColoredText(Theme.Aqua, this.MatchInfo.mapAuthors[0]);
				}

				let text =
					ColorUtil.ColoredText(Theme.White, `<b>BedWars.com</b>`) +
					ColorUtil.ColoredText(Theme.Gray, "    Time: ") +
					ColorUtil.ColoredText(Theme.Green, time) +
					"    " +
					map;
				this.tablistController.SetTitleText(text);
				if (this.MatchInfo) {
					Dependency<FriendsController>().SetCustomGameTitle("BedWars | " + this.MatchInfo?.mapName);
				} else {
					Dependency<FriendsController>().SetCustomGameTitle("BedWars | In Game");
				}
			},
			true,
		);
	}

	/**
	 * Returns current match state.
	 * @returns Current `MatchState`.
	 */
	public GetState(): MatchState {
		return this.state;
	}
}
