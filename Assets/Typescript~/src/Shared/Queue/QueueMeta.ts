import { TeamMeta } from "./TeamMeta";

export interface QueueMeta {
	name: string;
	teams: TeamMeta[];
	maps: string[];
}
