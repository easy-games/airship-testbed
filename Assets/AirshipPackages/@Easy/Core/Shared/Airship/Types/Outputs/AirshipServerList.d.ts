import { AirshipServerAccessMode } from "../Inputs/AirshipTransfers";

export interface ServerListEntry {
	serverId: string;
	players: string[];
	maxPlayers: number;
	name?: string;
	description?: string;
	sceneId: string;
	accessMode: AirshipServerAccessMode;
}
