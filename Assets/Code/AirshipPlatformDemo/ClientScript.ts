import { Platform } from "@Easy/Core/Shared/Airship";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Network } from "Code/Network";
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
				const data = await Platform.Client.User.GetUsersById(
					event.map((u) => u.id),
					false,
				);
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
