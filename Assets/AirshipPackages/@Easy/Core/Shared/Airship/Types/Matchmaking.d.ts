import {
	GameCoordinatorGroups,
	GameCoordinatorMatchmaking,
	GameCoordinatorMatchmakingDebug
} from "../../TypePackages/game-coordinator-types";

export type AirshipJoinQueueDto = GameCoordinatorMatchmaking.JoinQueueDto;

export type AirshipMatchmakingGroup = GameCoordinatorGroups.Group;

export type AirshipMatchTeamGroupPlayer = GameCoordinatorMatchmakingDebug.MatchmakingMatchTeamGroupPlayer;
export type AirshipMatchTeamGroup = GameCoordinatorMatchmakingDebug.MatchmakingMatchTeamGroup;
export type AirshipMatchTeam = GameCoordinatorMatchmakingDebug.MatchmakingMatchTeam;
export type AirshipMatchConfig = GameCoordinatorMatchmakingDebug.MatchmakingMatchConfig;
