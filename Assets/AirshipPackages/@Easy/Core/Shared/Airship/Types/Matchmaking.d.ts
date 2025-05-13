import { GameCoordinatorGroups, GameCoordinatorMatchmaking, GameCoordinatorUsers } from "../../TypePackages/game-coordinator-types";

export type Group = GameCoordinatorGroups.Group;
interface MatchTeamGroupPlayer extends GameCoordinatorUsers.PublicUser {
    id: string;
    attributes: Record<string, unknown>;
}
interface MatchTeamGroup {
    id: string;
    players: MatchTeamGroupPlayer[];
    attributes: Record<string, unknown>;
}
interface MatchTeam {
    name: string;
    groups: MatchTeamGroup[];
}

export type MatchConfig = {
    teams: MatchTeam[]
};
