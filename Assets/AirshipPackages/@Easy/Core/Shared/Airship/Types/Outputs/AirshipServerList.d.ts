import { AirshipServerAccessMode } from "../Inputs/AirshipTransfers";
import { PublicUser } from "./AirshipUser";

export interface ServerListEntry {
	serverId: string;
	playerCount: number;
	maxPlayers: number;
	name?: string;
	description?: string;
	sceneId: string;
	accessMode: AirshipServerAccessMode;
}

export interface ServerListEntryWithFriends extends ServerListEntry {
	friends: PublicUser[];
}
