import { Player } from "../Player/Player";
import { Team } from "./Team";
export declare class ChangeTeamSignal {
    readonly player: Player;
    readonly team: Team | undefined;
    readonly oldTeam: Team | undefined;
    constructor(player: Player, team: Team | undefined, oldTeam: Team | undefined);
}
