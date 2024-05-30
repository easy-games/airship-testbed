import { Controller, OnStart, Service } from "@Easy/Core/Shared/Flamework";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Signal, SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { Team } from "./Team";

interface TeamEntry {
  team: Team;
  bin: Bin;
}

@Controller()
@Service()
export class TeamsSingleton implements OnStart {
  public readonly onPlayerChangeTeam = new Signal<
    [player: Player, newTeam: Team, oldTeam: Team | undefined]
  >();
  public readonly onTeamAdded = new Signal<Team>();

  private teams = new Map<string, TeamEntry>();

  constructor() {
    Airship.teams = this;
  }

  OnStart(): void {
    if (RunUtil.IsClient()) {
      CoreNetwork.ServerToClient.AddTeams.client.OnServerEvent((teamDtos) => {
        for (let dto of teamDtos) {
          const team = new Team(
            dto.name,
            dto.id,
            new Color(dto.color[0], dto.color[1], dto.color[2], dto.color[3])
          );
          this.teams.set(dto.id, {
            team,
            bin: new Bin(),
          });
          this.onTeamAdded.Fire(team);
          for (let userId of dto.userIds) {
            const player = Airship.players.FindByUserId(userId);
            if (player) {
              team.AddPlayer(player);
            }
          }
        }
      });

      CoreNetwork.ServerToClient.RemoveTeams.client.OnServerEvent((teamIds) => {
        for (let teamId of teamIds) {
          const team = this.FindById(teamId);
          if (!team) continue;

          this.teams.delete(teamId);
        }
      });

      CoreNetwork.ServerToClient.AddPlayerToTeam.client.OnServerEvent(
        (teamId, userId) => {
          const team = this.FindById(teamId);
          if (!team) return;

          const player = Airship.players.FindByUserId(userId);
          if (!player) return;

          team.AddPlayer(player);
        }
      );

      CoreNetwork.ServerToClient.RemovePlayerFromTeam.client.OnServerEvent(
        (teamId, playerId) => {
          const team = this.FindById(teamId);
          if (!team) return;

          const player = Airship.players.FindByUserId(playerId);
          if (!player) return;

          team.RemovePlayer(player);
        }
      );
    }
    if (RunUtil.IsServer()) {
      Airship.players.onPlayerJoined.ConnectWithPriority(
        SignalPriority.LOWEST,
        (player) => {
          const teamDtos = ObjectUtils.values(this.teams).map((e) =>
            e.team.Encode()
          );
          CoreNetwork.ServerToClient.AddTeams.server.FireClient(
            player,
            teamDtos
          );
        }
      );
    }
  }

  /**
   * **SERVER ONLY**
   *
   * @param team
   * @returns
   */
  public RegisterTeam(team: Team): void {
    if (!RunUtil.IsServer()) {
      error("RegisterTeam can only be called by the server.");
    }
    if (this.teams.has(team.id)) {
      print("Tried to register duplicate team id: " + team.id + ". Ignoring.");
      return;
    }

    const entry: TeamEntry = {
      team,
      bin: new Bin(),
    };
    this.teams.set(team.id, entry);

    this.onTeamAdded.Fire(team);

    const dto = team.Encode();
    CoreNetwork.ServerToClient.AddTeams.server.FireAllClients([dto]);

    entry.bin.Add(
      team.onPlayerAdded.Connect((player) => {
        CoreNetwork.ServerToClient.AddPlayerToTeam.server.FireAllClients(
          team.id,
          player.userId
        );
      })
    );
    entry.bin.Add(
      team.onPlayerRemoved.Connect((player) => {
        CoreNetwork.ServerToClient.RemovePlayerFromTeam.server.FireAllClients(
          team.id,
          player.userId
        );
      })
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
    CoreNetwork.ServerToClient.RemoveTeams.server.FireAllClients([team.id]);
  }

  /**
   * Fetch all teams.
   * @returns All teams.
   */
  public GetTeams(): Team[] {
    return ObjectUtils.values(this.teams).map((entry) => entry.team);
  }

  /**
   * Fetch a team by name.
   * @param teamName A team name.
   * @returns Team that corresponds to name, if it exists.
   */
  public FindByName(teamName: string): Team | undefined {
    return ObjectUtils.values(this.teams).find(
      (entry) => entry.team.name === teamName
    )?.team;
  }

  /**
   * Fetch a team by id.
   * @param teamId A team id.
   * @returns Team that corresponds to id, if it exists.
   */
  public FindById(teamId: string): Team | undefined {
    return this.teams.get(teamId)?.team;
  }
}
