import { Player } from "Shared/Player/Player";
import { Team } from "./Team";
export declare class ChangeTeamSignal {
    readonly Player: Player;
    readonly Team: Team | undefined;
    readonly OldTeam: Team | undefined;
    constructor(Player: Player, Team: Team | undefined, OldTeam: Team | undefined);
}
