import { GameCoordinatorGroups, GameCoordinatorUsers } from "../../TypePackages/game-coordinator-types";

export type AirshipMatchmakingGroup = GameCoordinatorGroups.Group;

export interface AirshipMatchTeamGroupPlayer extends GameCoordinatorUsers.PublicUser {
	id: string;
	attributes: Record<string, unknown>;
}

export interface AirshipMatchTeamGroup {
	id: string;
	players: AirshipMatchTeamGroupPlayer[];
	attributes: Record<string, unknown>;
}

export interface AirshipMatchTeam {
	name: string;
	groups: AirshipMatchTeamGroup[];
}

export interface AirshipMatchConfig {
	teams: AirshipMatchTeam[];
}
