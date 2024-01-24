import { OnStart } from "../../../node_modules/@easy-games/flamework-core";
import { Player } from "../Player/Player";
import { Signal } from "../Util/Signal";
import { Team } from "./Team";
export declare class TeamsSingleton implements OnStart {
    readonly onPlayerChangeTeam: Signal<[player: Player, newTeam: Team, oldTeam: Team | undefined]>;
    readonly onTeamAdded: Signal<Team>;
    private teams;
    constructor();
    OnStart(): void;
    /**
     * **SERVER ONLY**
     *
     * @param team
     * @returns
     */
    RegisterTeam(team: Team): void;
    /**
     * Deletes provided team.
     * @param team A team.
     */
    RemoveTeam(team: Team): void;
    /**
     * Fetch all teams.
     * @returns All teams.
     */
    GetTeams(): Team[];
    /**
     * Fetch a team by name.
     * @param teamName A team name.
     * @returns Team that corresponds to name, if it exists.
     */
    FindByName(teamName: string): Team | undefined;
    /**
     * Fetch a team by id.
     * @param teamId A team id.
     * @returns Team that corresponds to id, if it exists.
     */
    FindById(teamId: string): Team | undefined;
}
