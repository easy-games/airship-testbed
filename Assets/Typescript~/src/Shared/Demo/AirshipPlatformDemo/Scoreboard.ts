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

	private sessionKills = 0;
	private totalKills = 0;

	private sessionKillMap = new Map<Player, number>();
	private totalKillMap = new Map<Player, number>();

	override Start(): void {
		if (RunUtil.IsClient()) this.ClientStart();
		if (RunUtil.IsServer()) this.ServerStart();
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

		this.bin.Add(
			Network.ServerToClient.KillData.client.OnServerEvent((rank, total) => {
				this.totalKills = total;
				this.totalKillsScore.text = `Total Kills: ${this.sessionKills + this.totalKills}`;
				this.currentRank.text = `Rank: ${rank}`;
			}),
		);

		this.bin.Add(
			Network.ServerToClient.TopScores.client.OnServerEvent(async (event) => {
				const { data } = await Dependency<UserController>().GetUsersById(
					event.map((u) => u.id),
					false,
				);
				if (!data) return;
				this.leaderList.text = event.reduce((text, value, index) => {
					text += `${value.rank}: ${data[index]} (${value.value})\n`;
					return text;
				}, "Leaders:\n");
			}),
		);
	}

	private ServerStart() {
		const coreServerSignals = import("@Easy/Core/Server/CoreServerSignals").expect().CoreServerSignals;
		this.bin.Add(
			coreServerSignals.EntityDeath.Connect((event) => {
				const killer = event.killer?.player;
				if (!killer) return;

				let kills = this.sessionKillMap.get(killer) ?? 0;
				this.sessionKillMap.set(killer, ++kills);
			}),
		);

		this.bin.Add(
			coreServerSignals.PlayerLeave.Connect(async (event) => {
				await this.UpdateDatastore(event.player);
				await this.UpdateLeaderboard(event.player);
				this.sessionKillMap.delete(event.player);
				this.totalKillMap.delete(event.player);
			}),
		);

		this.bin.Add(
			coreServerSignals.PlayerJoin.Connect(async (event) => {
				const res = await Dependency<LeaderboardService>().GetRank("TopDemoSessionKills", event.player.userId);
				if (!res.success) return;
				const dataRes = await Dependency<DataStoreService>().GetKey<{ kills: number }>(event.player.userId);
				if (!dataRes.success) return;
				const topRes = await Dependency<LeaderboardService>().GetRankRange("TopDemoSessionKills", 0, 3);
				if (!topRes.success) return;

				Network.ServerToClient.KillData.server.FireClient(
					event.player.clientId,
					res.data?.value ?? "No Rank",
					dataRes.data?.kills ?? 0,
				);

				Network.ServerToClient.TopScores.server.FireAllClients(topRes.data);
			}),
		);

		this.bin.Add(
			SetInterval(30, async () => {
				const scores: { [playerId: string]: number } = {};
				this.sessionKillMap.forEach(async (value, player) => {
					await this.UpdateDatastore(player);
					scores[player.userId] = value;
				});
			}),
		);
	}

	private async UpdateDatastore(player: Player) {
		let totalKills = this.totalKillMap.get(player) ?? 0;
		let sessionKills = this.sessionKillMap.get(player) ?? 0;
		if (!sessionKills) return;

		await Dependency<DataStoreService>().SetKey(player.userId, { kills: sessionKills + totalKills });
	}

	private async UpdateLeaderboard(player: Player) {
		let sessionKills = this.sessionKillMap.get(player) ?? 0;
		await Dependency<LeaderboardService>().Update("TopDemoSessionKills", { [player.userId]: sessionKills });
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
