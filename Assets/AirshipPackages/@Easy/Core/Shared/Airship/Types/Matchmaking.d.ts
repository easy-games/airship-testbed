import {
	GameCoordinatorGroups,
	GameCoordinatorMatchmaking,
	GameCoordinatorUsers,
} from "../../TypePackages/game-coordinator-types";

export type AirshipJoinQueueDto = GameCoordinatorMatchmaking.JoinQueueDto;

export type AirshipMatchmakingGroup = GameCoordinatorGroups.Group;

export type AirshipMatchTeamGroupPlayer = GameCoordinatorMatchmaking.MatchmakingMatchTeamGroupPlayer;
export type AirshipMatchTeamGroup = GameCoordinatorMatchmaking.MatchmakingMatchTeamGroup;
export type AirshipMatchTeam = GameCoordinatorMatchmaking.MatchmakingMatchTeam;
export type AirshipMatchConfig = GameCoordinatorMatchmaking.MatchmakingMatchConfig;
