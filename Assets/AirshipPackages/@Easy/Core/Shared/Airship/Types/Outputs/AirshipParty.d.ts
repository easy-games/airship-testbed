import { PublicUser } from "./AirshipUser";

/**
 * Information about a users party.
 */
export interface GameServerPartyData {
	partyId: string;
	leader: string;
	mode: PartyMode;
	lastUpdated: number;
	members: PublicUser[];
	status: PartyStatus;
}

export type Party = {
	leader: string;
	partyId: string;
	/** Members includes the leader */
	members: PublicUser[];
	invited: string[];
	data: PartyStateData;
	mode: PartyMode;
	lastUpdated: number;
};

export enum PartyStatus {
	IN_GAME = "in_game",
	QUEUED = "queued",
	IDLE = "idle",
}

export enum PartyMode {
	/** Invite only */
	CLOSED = "closed",
	/** Open to all */
	OPEN = "open",
	/** Friends can join */
	FRIENDS_ONLY = "friends_only",
}

interface BaseStateData<T extends PartyStatus> {
	status: T;
}

type PartyIdleStateData = BaseStateData<PartyStatus.IDLE>;

interface PartyQueuedStateData extends BaseStateData<PartyStatus.QUEUED> {
	queue: string;
	regions: string[];
	startTime: number;
	ticketId: string;
}

interface PartyInGameStateData extends BaseStateData<PartyStatus.IN_GAME> {
	queue: string;
	matchId: string;
	startTime: number;
	gameServer: GameServer;
}

export type PartyStateData = PartyIdleStateData | PartyQueuedStateData | PartyInGameStateData;
