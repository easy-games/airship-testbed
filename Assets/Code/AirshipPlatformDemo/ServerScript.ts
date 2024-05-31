import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";
import { Network } from "Code/Network";

export default class TestScript extends AirshipBehaviour {
	public spawnArea!: GameObject;

	private sessionKillMap = new Map<Player, number>();
	private totalKillMap = new Map<Player, number>();

	private bin = new Bin();

	override Awake(): void {
		if (!RunUtil.IsServer()) return;
	}

	override Start(): void {
		if (!RunUtil.IsServer()) return;

		// Only runs server

		// const bounds = this.spawnArea.GetComponent<BoxCollider>("Box Collider").bounds;

		Airship.damage.onDeath.Connect((damageInfo) => {
			const killer = damageInfo.attacker?.GetAirshipComponent<Character>()?.player;
			if (!killer) return;

			let kills = this.sessionKillMap.get(killer) ?? 0;
			this.sessionKillMap.set(killer, ++kills);
		});

		Airship.players.onPlayerDisconnected.Connect(async (player) => {
			await this.UpdateDatastore(player);
			await this.UpdateLeaderboard(player);
			this.sessionKillMap.delete(player);
			this.totalKillMap.delete(player);
		});

		this.bin.Add(
			Airship.players.onPlayerJoined.Connect(async (player) => {
				const res = await Platform.server.leaderboard.GetRank("TopDemoSessionKills", player.userId);
				if (!res.success) return;
				const dataRes = await Platform.server.dataStore.GetKey<{ kills: number }>(player.userId);
				if (!dataRes.success) return;
				const topRes = await Platform.server.leaderboard.GetRankRange("TopDemoSessionKills", 0, 3);
				if (!topRes.success) return;

				this.totalKillMap.set(player, dataRes.data?.kills ?? 0);

				Network.ServerToClient.KillData.server.FireClient(
					player,
					res.data?.rank !== undefined ? `${res.data.rank}` : "No Rank",
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

		// for (let i = 0; i < 25; i++) {
		// 	const randomLoc = new Vector3(
		// 		math.random(bounds.min.x, bounds.max.x),
		// 		math.random(bounds.min.y, bounds.max.y) + 1,
		// 		math.random(bounds.min.z, bounds.max.z),
		// 	);
		// 	this.entityService.SpawnEntity(EntityPrefabType.HUMAN, randomLoc);
		// }

		// SetInterval(0.25, () => {
		// 	if (this.entityService.GetEntities().size() > 25) return;

		// 	const randomLoc = new Vector3(
		// 		math.random(bounds.min.x, bounds.max.x),
		// 		math.random(bounds.min.y, bounds.max.y) + 1,
		// 		math.random(bounds.min.z, bounds.max.z),
		// 	);
		// 	this.entityService.SpawnEntity(EntityPrefabType.HUMAN, randomLoc);
		// });
	}

	private async UpdateDatastore(player: Player) {
		let totalKills = this.totalKillMap.get(player) ?? 0;
		let sessionKills = this.sessionKillMap.get(player) ?? 0;
		if (!sessionKills) return;

		await Platform.server.dataStore.SetKey(player.userId, { kills: sessionKills + totalKills });
	}

	private async UpdateLeaderboard(player: Player) {
		let sessionKills = this.sessionKillMap.get(player) ?? 0;
		await Platform.server.leaderboard.Update("TopDemoSessionKills", { [player.userId]: sessionKills });
	}

	override OnDestroy(): void {}
}
