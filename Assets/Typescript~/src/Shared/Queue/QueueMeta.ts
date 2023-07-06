import { GameMap } from "Server/Services/Match/Map/Maps";
import { TeamMeta } from "./TeamMeta";

export interface QueueMeta {
	name: string;
	teams: TeamMeta[];
	maps: GameMap[];
}
