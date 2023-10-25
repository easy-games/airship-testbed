import { Controller, OnStart } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Team } from "Shared/Team/Team";
import { PlayerController } from "../Player/PlayerController";

@Controller({})
export class TeamController implements OnStart {
	private teams = new Map<string, Team>();

	constructor(private readonly playerController: PlayerController) {}

	OnStart(): void {
		CoreNetwork.ServerToClient.AddTeams.Client.OnServerEvent((teamDtos) => {
			for (let dto of teamDtos) {
				const team = new Team(
					dto.name,
					dto.id,
					new Color(dto.color[0], dto.color[1], dto.color[2], dto.color[3]),
				);
				this.teams.set(dto.id, team);
				for (let userId of dto.userIds) {
					const player = this.playerController.GetPlayerFromUserId(userId);
					if (player) {
						team.AddPlayer(player);
					}
				}
			}
		});

		CoreNetwork.ServerToClient.RemoveTeams.Client.OnServerEvent((teamIds) => {
			for (let teamId of teamIds) {
				const team = this.GetTeam(teamId);
				if (!team) continue;

				this.teams.delete(teamId);
			}
		});

		CoreNetwork.ServerToClient.AddPlayerToTeam.Client.OnServerEvent((teamId, userId) => {
			const team = this.GetTeam(teamId);
			if (!team) return;

			const player = this.playerController.GetPlayerFromUserId(userId);
			if (!player) return;

			team.AddPlayer(player);
		});

		CoreNetwork.ServerToClient.RemovePlayerFromTeam.Client.OnServerEvent((teamId, playerId) => {
			const team = this.GetTeam(teamId);
			if (!team) return;

			const player = this.playerController.GetPlayerFromUserId(playerId);
			if (!player) return;

			team.RemovePlayer(player);
		});
	}

	public GetTeam(teamId: string): Team | undefined {
		return this.teams.get(teamId);
	}

	public GetTeams(): Team[] {
		return Object.values(this.teams);
	}
}
