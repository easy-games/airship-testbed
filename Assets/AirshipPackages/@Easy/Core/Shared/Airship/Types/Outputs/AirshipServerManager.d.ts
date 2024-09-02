import { AirshipServerAccessMode } from "../Inputs/AirshipTransfers";
import { PublicUser } from "./AirshipUser";

export interface PublicServerData {
	serverId: string;
	playerCount: number;
	maxPlayers: number;
	name?: string;
	description?: string;
	sceneId: string;
	accessMode: AirshipServerAccessMode;
	tags: string[];
}

export interface ServerListEntryWithFriends extends PublicServerData {
	friends: PublicUser[];
}

export type CreateServerResponse = {
	serverId: string;
};
