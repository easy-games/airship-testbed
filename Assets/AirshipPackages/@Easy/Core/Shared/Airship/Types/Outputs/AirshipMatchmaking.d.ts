import { PublicUser } from "./AirshipUser";

export interface Group {
	groupId: string;
	gameId: string;
	members: GroupMember[];
	status: GroupStatus;
	createdAt: number;
}

export interface GroupMember extends PublicUser {
	active: boolean;
}

export enum GroupState {
	IN_QUEUE = "IN_QUEUE",
	IN_MATCH = "IN_MATCH",
	IDLE = "IDLE",
}

interface QueueData {
	state: GroupState.IN_QUEUE;
	queueId: string;
	joinedAt: number;
}

interface MatchData {
	state: GroupState.IN_MATCH;
	queueId: string;
	serverId: string;
	createdAt: number;
}

interface IdleData {
	state: GroupState.IDLE;
}

/**
 * Current state of a matchmaking group.
 * IDLE - The matchmaking group is not in a queue or match.
 * IN_QUEUE - The matchmaking group is in a queue and is waiting to be matched with other groups.
 * IN_MATCH - The matchmaking group is currently in a match.
 */
export type GroupStatus = QueueData | MatchData | IdleData;

/**
 * The configuration provided to a server created by the matchmaker.
 */
export interface MatchConfig {
	/** The teams created for this match */
	teams: MatchTeam[];
}

/** A team in a match. */
interface MatchTeam {
	/** The name of the team as provided in the queue configuration. */
	name: string;
	/** The groups which make up the team. */
	groups: MatchTeamGroup[];
}

/** A group that makes up part of a team in a match. */
interface MatchTeamGroup {
	/** The id of the group. */
	id: string;
	/** The players in the group. */
	players: MatchTeamGroupPlayer[];
	/** The attributes provided with this group when they joined the matchmaking queue. */
	attributes: Record<string, any>;
}


/** A player in a group that is part of a team in a match. */
type MatchTeamGroupPlayer = PublicUser & {
	/** The attributes provided with this player when they joined the matchmaking queue with their group. */
	attributes: Record<string, any>;
};
