export interface AirshipGameServer {
	serverId: string;
	ip: string;
	port: number;
}

export type CreateServerResponse = {
	serverId: string;
};
