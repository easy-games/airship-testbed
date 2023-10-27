import { TeamController } from "@Easy/Core/Client/Controllers/Team/TeamController";
import { Game } from "@Easy/Core/Shared/Game";
import { Team } from "@Easy/Core/Shared/Team/Team";
import { Controller, OnStart } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { MatchTeamStatsDto } from "Shared/Match/MatchTeamStatsDto";
import { Network } from "Shared/Network";
import { MatchStatsController } from "./MatchStatsController";

@Controller({})
export class BWMatchHudController implements OnStart {
	private hudGo: GameObject;
	private refs: GameObjectReferences;

	constructor(
		private readonly matchStatsController: MatchStatsController,
		private readonly teamController: TeamController,
	) {
		this.hudGo = GameObject.Find("MatchHUD");
		this.refs = this.hudGo.GetComponent<GameObjectReferences>();
	}

	OnStart(): void {
		this.matchStatsController.onStatsUpdated.Connect((userId, newStats, oldStats) => {
			print("stats.1");
			if (userId !== Game.LocalPlayer.userId) return;
			print("stats.2");

			if (newStats.kills !== oldStats.kills) {
				print("stats.3");
				this.UpdateKills(newStats.kills);
			}
		});

		const teamsWrapperGo = this.hudGo.transform.GetChild(0);
		const teams = this.teamController.GetTeams();
		let i = 0;
		for (const team of teams) {
			const go = teamsWrapperGo.GetChild(i);
			go.gameObject.name = team.id;
			this.UpdateTeam(team, go.gameObject, undefined);
			i++;
		}
		this.teamController.onTeamAdded.Connect((team) => {
			const go = teamsWrapperGo.GetChild(i);
			go.name = team.id;
			this.UpdateTeam(team, go.gameObject, undefined);
			i++;
		});
		Bridge.UpdateLayout(teamsWrapperGo.transform, false);

		Network.ServerToClient.UpdateMatchTeamStats.Client.OnServerEvent((stats) => {
			print("received udpate match team stats: " + inspect(stats));
			for (const teamStats of stats) {
				const team = this.teamController.GetTeam(teamStats.id);
				this.UpdateTeam(team!, undefined, teamStats);
			}
		});

		Network.ClientToServer.GetAllMatchTeamStats.Client.FireServer();
	}

	public UpdateKills(kills: number): void {
		const killsText = this.refs.GetValue("UI", "KillsText") as TMP_Text;
		killsText.text = kills + "";
	}

	public UpdateTeam(team: Team, go: GameObject | undefined, stats: MatchTeamStatsDto | undefined): void {
		if (!go) {
			go = this.hudGo.transform.GetChild(0).FindChild(team.id)?.gameObject;
		}
		if (!go) {
			print("failed to find team go for hud update: " + team.id);
			return;
		}

		const playersRemaining = stats?.playersRemaining ?? 0;
		const bedAlive = stats?.bed ?? true;

		const aliveText = go.transform.GetChild(0).GetComponent<TMP_Text>();
		aliveText.text = playersRemaining + "";

		const image = go.GetComponent<Image>();
		if (bedAlive) {
			image.color = new Color(team.color.r, team.color.g, team.color.b, 0.5);
		} else {
			image.color = new Color(team.color.r, team.color.g, team.color.b, 0.02);
		}
	}
}
