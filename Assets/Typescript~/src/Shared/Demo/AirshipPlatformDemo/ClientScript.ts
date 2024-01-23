import { UserController } from "@Easy/Core/Client/Airship/User/UserController";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Dependency } from "@easy-games/flamework-core";
import { Network } from "Shared/Network";
import Scoreboard from "./Scoreboard";

export default class ClientScript extends AirshipBehaviour {
	private bin = new Bin();

	public scoreboard!: Scoreboard;

	override Start(): void {
		if (!RunUtil.IsClient()) return;

		const go = GameObject.Find("Scoreboard");
		this.scoreboard = go.GetComponent<Scoreboard>();

		// Only runs on client
		const coreClientSignals = import("@Easy/Core/Client/CoreClientSignals").expect().CoreClientSignals;

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
