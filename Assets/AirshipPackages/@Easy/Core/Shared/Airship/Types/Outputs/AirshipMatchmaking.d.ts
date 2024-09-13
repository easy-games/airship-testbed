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

export type GroupStatus = QueueData | MatchData | IdleData;
