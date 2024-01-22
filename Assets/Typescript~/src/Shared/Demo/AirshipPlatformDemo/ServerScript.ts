import { DataStoreService } from "@Easy/Core/Server/Airship/DataStore/DataStoreService";
import { LeaderboardService } from "@Easy/Core/Server/Airship/Leaderboard/LeaderboardService";
import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { EntityPrefabType } from "@Easy/Core/Shared/Entity/EntityPrefabType";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RandomUtil } from "@Easy/Core/Shared/Util/RandomUtil";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { SetInterval, SetTimeout } from "@Easy/Core/Shared/Util/Timer";
import { Dependency } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { Network } from "Shared/Network";

export default class TestScript extends AirshipBehaviour {
	private entityService!: EntityService;
	public spawnArea!: GameObject;

	private sessionKillMap = new Map<Player, number>();
	private totalKillMap = new Map<Player, number>();

	private bin = new Bin();

	override Awake(): void {
		if (!RunUtil.IsServer()) return;
		this.entityService = Dependency<EntityService>();
	}

	override Start(): void {
		if (!RunUtil.IsServer()) return;

		// Only runs server

		const bounds = this.spawnArea.GetComponent<BoxCollider>("Box Collider").bounds;

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

				this.totalKillMap.set(event.player, dataRes.data?.kills ?? 0);

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

		for (let i = 0; i < 25; i++) {
			const randomLoc = new Vector3(
				math.random(bounds.min.x, bounds.max.x),
				math.random(bounds.min.y, bounds.max.y) + 1,
				math.random(bounds.min.z, bounds.max.z),
			);
			this.entityService.SpawnEntity(EntityPrefabType.HUMAN, randomLoc);
		}

		SetInterval(1, () => {
			if (this.entityService.GetEntities().size() > 25) return;

			const randomLoc = new Vector3(
				math.random(bounds.min.x, bounds.max.x),
				math.random(bounds.min.y, bounds.max.y) + 1,
				math.random(bounds.min.z, bounds.max.z),
			);
			this.entityService.SpawnEntity(EntityPrefabType.HUMAN, randomLoc);
		});
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

	override OnDestroy(): void {}
}
