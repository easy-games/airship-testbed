import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { TabListController } from "Imports/Core/Client/Controllers/TabList/TabListController";
import { ColorUtil } from "Imports/Core/Shared/Util/ColorUtil";
import { Theme } from "Imports/Core/Shared/Util/Theme";
import { TimeUtil } from "Imports/Core/Shared/Util/TimeUtil";
import { SetInterval } from "Imports/Core/Shared/Util/Timer";
import { MatchInfoDto } from "Shared/Match/MatchInfoDto";
import { MatchState } from "Shared/Match/MatchState";
import { Network } from "Shared/Network";

@Controller({})
export class MatchController implements OnStart {
	/** Initial state is always `MatchState.SETUP. */
	private state: MatchState = MatchState.SETUP;
	public matchStartTime: number | undefined;
	public matchInfo: MatchInfoDto | undefined;

	constructor(private readonly tablistController: TabListController) {
		Network.ServerToClient.MatchInfo.Client.OnServerEvent((matchInfoDto) => {
			this.matchInfo = matchInfoDto;
			this.state = matchInfoDto.matchState;
			if (matchInfoDto.matchStartTime !== undefined) {
				this.matchStartTime = matchInfoDto.matchStartTime;
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
			this.matchStartTime = TimeUtil.GetServerTime();
			/* Fire signal */
			ClientSignals.MatchStart.Fire();
		});

		let timer = 0;
		if (this.matchStartTime !== undefined) {
			timer = math.floor(this.matchStartTime - TimeUtil.GetServerTime());
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
				if (this.matchInfo) {
					map =
						ColorUtil.ColoredText(Theme.Aqua, "<b>" + this.matchInfo.mapName + "</b>") +
						ColorUtil.ColoredText(Theme.Gray, " by ") +
						ColorUtil.ColoredText(Theme.Aqua, this.matchInfo.mapAuthors[0]);
				}

				let text =
					ColorUtil.ColoredText(Theme.White, `<b>BedWars.com</b>`) +
					ColorUtil.ColoredText(Theme.Gray, "    Time: ") +
					ColorUtil.ColoredText(Theme.Green, time) +
					"    " +
					map;
				this.tablistController.SetTitleText(text);
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
