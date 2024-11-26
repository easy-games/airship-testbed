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
}

export type Party = {
	leader: string;
	partyId: string;
	/** Members includes the leader */
	members: PublicUser[];
	invited: string[];
	mode: PartyMode;
	lastUpdated: number;
};

export const enum PartyMode {
	/** Invite only */
	CLOSED = "closed",
	/** Open to all */
	OPEN = "open",
	/** Friends can join */
	FRIENDS_ONLY = "friends_only",
}
