import { TeamController } from "@Easy/Core/Client/Controllers/Team/TeamController";
import { Team } from "@Easy/Core/Shared/Team/Team";
import { Controller, OnStart } from "@easy-games/flamework-core";
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
		const teamsWrapperGo = this.hudGo.transform.GetChild(0);
		const teams = this.teamController.GetTeams();
		let i = 0;
		for (const team of teams) {
			if (i >= teamsWrapperGo.childCount) return;
			const go = teamsWrapperGo.GetChild(i);
			if (!go) {
				error("Failed to find team wrapper for " + i);
			}
			go.gameObject.name = team.id;
			this.UpdateTeam(team, go.gameObject, undefined);
			i++;
		}
		this.teamController.onTeamAdded.Connect((team) => {
			if (i >= teamsWrapperGo.childCount) return;
			const go = teamsWrapperGo.GetChild(i);
			if (!go) {
				error("Failed to find team wrapper for " + i);
			}
			go.name = team.id;
			this.UpdateTeam(team, go.gameObject, undefined);
			i++;
		});
		Bridge.UpdateLayout(teamsWrapperGo.transform, false);

		Network.ServerToClient.UpdateHud.client.OnServerEvent((event) => {
			if (event.teamUpdates) {
				for (const teamStats of event.teamUpdates) {
					const team = this.teamController.GetTeam(teamStats.id);
					if (team) {
						this.UpdateTeam(team, undefined, teamStats);
					} else {
						warn("Failed to find team in UpdateHud remote.");
					}
				}
			}
			if (event.kills !== undefined) {
				this.UpdateKills(event.kills);
			}
		});
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
