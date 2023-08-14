import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { ExampleService } from "Imports/ExamplePackage/Server/ExampleService";
import { ServerSignals } from "Server/ServerSignals";
import { CoreNetwork } from "Shared/Network";
import { Team } from "Shared/Team/Team";
import { Bin } from "Shared/Util/Bin";
import { SignalPriority } from "Shared/Util/Signal";

interface TeamEntry {
	team: Team;
	bin: Bin;
}

@Service({})
export class TeamService implements OnStart {
	private teams = new Map<string, TeamEntry>();

	OnStart(): void {
		ServerSignals.PlayerJoin.ConnectWithPriority(SignalPriority.LOWEST, (event) => {
			const teamDtos = Object.values(this.teams).map((e) => e.team.Encode());
			CoreNetwork.ServerToClient.AddTeams.Server.FireClient(event.player.clientId, teamDtos);
		});

		Dependency<ExampleService>();
	}

	public RegisterTeam(team: Team): void {
		if (this.teams.has(team.id)) {
			print("Tried to register duplicate team id: " + team.id + ". Ignoring.");
			return;
		}

		const entry: TeamEntry = {
			team,
			bin: new Bin(),
		};
		this.teams.set(team.id, entry);
		const dto = team.Encode();
		CoreNetwork.ServerToClient.AddTeams.Server.FireAllClients([dto]);

		entry.bin.Add(
			team.onPlayerAdded.Connect((player) => {
				CoreNetwork.ServerToClient.AddPlayerToTeam.Server.FireAllClients(team.id, player.userId);
			}),
		);
		entry.bin.Add(
			team.onPlayerRemoved.Connect((player) => {
				CoreNetwork.ServerToClient.RemovePlayerFromTeam.Server.FireAllClients(team.id, player.userId);
			}),
		);
	}

	/**
	 * Deletes provided team.
	 * @param team A team.
	 */
	public RemoveTeam(team: Team): void {
		const entry = this.teams.get(team.id);
		if (!entry) return;

		entry.bin.Clean();
		CoreNetwork.ServerToClient.RemoveTeams.Server.FireAllClients([team.id]);
	}

	/**
	 * Fetch all teams.
	 * @returns All teams.
	 */
	public GetTeams(): Team[] {
		return Object.values(this.teams).map((entry) => entry.team);
	}

	/**
	 * Fetch a team by name.
	 * @param teamName A team name.
	 * @returns Team that corresponds to name, if it exists.
	 */
	public GetTeamByName(teamName: string): Team | undefined {
		return Object.values(this.teams).find((entry) => entry.team.name === teamName)?.team;
	}

	/**
	 * Fetch a team by id.
	 * @param teamId A team id.
	 * @returns Team that corresponds to id, if it exists.
	 */
	public GetTeamById(teamId: string): Team | undefined {
		return this.teams.get(teamId)?.team;
	}
}
