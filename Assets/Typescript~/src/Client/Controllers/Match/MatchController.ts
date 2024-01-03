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
	public matchStartTime: number | undefined;
	public matchInfo: MatchInfoDto | undefined;
	public eliminated = false;
	public onEliminated = new Signal<void>();

	constructor(private readonly tablistController: TabListController) {
		Network.ServerToClient.MatchInfo.client.OnServerEvent((matchInfoDto) => {
			this.matchInfo = matchInfoDto;
			this.state = matchInfoDto.matchState;
			if (matchInfoDto.matchStartTime !== undefined) {
				this.matchStartTime = matchInfoDto.matchStartTime;
			}
		});
		Network.ServerToClient.PlayerEliminated.client.OnServerEvent((clientId) => {
			if (clientId === Game.localPlayer.clientId) {
				this.eliminated = true;
				this.onEliminated.Fire();
			}
		});
	}

	OnStart(): void {
		/* Listen for match state change.  */
		Network.ServerToClient.MatchStateChange.client.OnServerEvent((newState, oldState) => {
			this.state = newState;
			/* Fire signal. */
			ClientSignals.MatchStateChange.Fire({ newState: this.state, oldState: oldState });
		});
		/* Listen for match start. */
		Network.ServerToClient.MatchStarted.client.OnServerEvent(() => {
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
						ColorUtil.ColoredText(Theme.aqua, "<b>" + this.matchInfo.mapName + "</b>") +
						ColorUtil.ColoredText(Theme.gray, " by ") +
						ColorUtil.ColoredText(Theme.aqua, this.matchInfo.mapAuthors[0]);
				}

				let text =
					ColorUtil.ColoredText(Theme.white, `<b>BedWars.com</b>`) +
					ColorUtil.ColoredText(Theme.gray, "    Time: ") +
					ColorUtil.ColoredText(Theme.green, time) +
					"    " +
					map;
				this.tablistController.SetTitleText(text);
				if (this.matchInfo) {
					Dependency<FriendsController>().SetCustomGameTitle("BedWars | " + this.matchInfo?.mapName);
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
