import { MatchState } from "./MatchState";

export interface MatchInfoDto {
	mapName: string;
	mapAuthors: string[];
	/** Only exists if the match started before this packet was sent. */
	matchStartTime?: number;
	matchState: MatchState;
}
