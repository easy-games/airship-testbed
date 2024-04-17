import { UserController } from "@Easy/Core/Client/Airship/User/UserController";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Network } from "Shared/Network";
import Scoreboard from "./Scoreboard";

export default class ClientScript extends AirshipBehaviour {
	private bin = new Bin();

	public scoreboard!: Scoreboard;

	override Start(): void {
		if (!RunUtil.IsClient()) return;

		const go = GameObject.Find("Scoreboard");
		if (!go) return;
		this.scoreboard = go.GetAirshipComponent<Scoreboard>()!;

		// Only runs on client

		this.bin.Add(
			Network.ServerToClient.TopScores.client.OnServerEvent(async (event) => {
				const { data } = await Dependency<UserController>().GetUsersById(
					event.map((u) => u.id),
					false,
				);
				if (!data) return;
				this.scoreboard.leaderList.text = event.reduce((text, value, index) => {
					text += `${value.rank}: ${data.map[value.id].username} (${value.value})\n`;
					return text;
				}, "Leaders:\n");
			}),
		);

		this.bin.Add(
			Network.ServerToClient.KillData.client.OnServerEvent((rank, total) => {
				this.scoreboard.totalKills = total;
				this.scoreboard.totalKillsScore.text = `Total Kills: ${this.scoreboard.sessionKills + total}`;
				this.scoreboard.currentRank.text = `Rank: ${rank}`;
			}),
		);
	}

	override OnDestroy(): void {}
}
