import { UserController } from "@Easy/Core/Client/Airship/User/UserController";
import { DataStoreService } from "@Easy/Core/Server/Airship/DataStore/DataStoreService";
import { LeaderboardService } from "@Easy/Core/Server/Airship/Leaderboard/LeaderboardService";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";
import { Dependency } from "@easy-games/flamework-core";
import { Network } from "Shared/Network";

export default class Scoreboard extends AirshipBehaviour {
	public totalKillsScore!: TMP_Text;
	public sessionKillsScore!: TMP_Text;
	public currentRank!: TMP_Text;
	public leaderList!: TMP_Text;

	private bin = new Bin();

	public sessionKills = 0;
	public totalKills = 0;

	override Start(): void {
		if (RunUtil.IsClient()) this.ClientStart();
	}

	private ClientStart() {
		this.sessionKillsScore.text = `Session Kills: ${this.sessionKills}`;

		// Only runs on client
		const coreClientSignals = import("@Easy/Core/Client/CoreClientSignals").expect().CoreClientSignals;
		this.bin.Add(
			coreClientSignals.EntityDeath.Connect((event) => {
				if (event.killer?.player !== Game.localPlayer) return;
				this.sessionKills++;
				this.sessionKillsScore.text = `Session Kills: ${this.sessionKills}`;
				this.totalKillsScore.text = `Total Kills: ${this.sessionKills + this.totalKills}`;
			}),
		);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
