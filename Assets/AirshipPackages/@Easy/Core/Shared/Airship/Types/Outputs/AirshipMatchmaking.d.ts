export interface Group {
	groupId: string;
	gameId: string;
	members: GroupMember[];
	status: GroupStatus;
	createdAt: number;
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
