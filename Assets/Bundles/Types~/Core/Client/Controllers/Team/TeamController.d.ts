import { OnStart } from "@easy-games/flamework-core";
import { Team } from "../../../Shared/Team/Team";
import { Signal } from "../../../Shared/Util/Signal";
import { PlayerController } from "../Player/PlayerController";
export declare class TeamController implements OnStart {
    private readonly playerController;
    private teams;
    onTeamAdded: Signal<[team: Team]>;
    constructor(playerController: PlayerController);
    OnStart(): void;
    GetTeam(teamId: string): Team | undefined;
    GetTeams(): Team[];
}
