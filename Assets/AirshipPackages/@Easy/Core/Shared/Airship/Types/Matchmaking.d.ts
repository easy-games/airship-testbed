import {
	GameCoordinatorGroups,
	GameCoordinatorMatchmaking
} from "../../TypePackages/game-coordinator-types";

export type AirshipJoinQueueDto = GameCoordinatorMatchmaking.JoinQueueDto;

export type AirshipMatchmakingGroup = GameCoordinatorGroups.Group;

export type AirshipMatchTeamGroupPlayer = GameCoordinatorMatchmaking.MatchmakingMatchTeamGroupPlayer;
export type AirshipMatchTeamGroup = GameCoordinatorMatchmaking.MatchmakingMatchTeamGroup;
export type AirshipMatchTeam = GameCoordinatorMatchmaking.MatchmakingMatchTeam;
export type AirshipMatchConfig = GameCoordinatorMatchmaking.MatchmakingMatchConfig;

export interface AirshipQueueStats {
    gameId: string;
	/** Name of queue in the create dashboard. */
    queueId: string;
	/** Number of players in queue */
    playerCount: number;
	/** Number of groups in queue */
    groupCount: number;
    timestamp: number;
	/** Estimated queue time in seconds */
    estimatedQueueTime: number;
}
