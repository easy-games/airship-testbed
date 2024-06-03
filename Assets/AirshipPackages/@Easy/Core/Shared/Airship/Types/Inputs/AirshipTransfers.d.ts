/** Describes how access will be provided. */
export const enum AirshipServerAccessMode {
	/** Only players that are transfered directly to the server using TransferToServer will be allowed. */
	DirectJoin = "DIRECT_JOIN",
	/** Any player can join. */
	Open = "OPEN",
	/** Only players in the allowed players list will be able to join. */
	Closed = "CLOSED",
}

/** Configuration for an Airship server. */
export interface AirshipServerConfig {
	/** The scene the server will start on. Defaults to the scene provided during deployment. */
	sceneId?: string;
	/** The access mode of the server. Defaults to OPEN. */
	accessMode?: AirshipServerAccessMode;
	/** The region the game server should be started in. Defaults to the same region as the server that makes the create request. */
	region?: string;
	/** Only allow the players in this list to join the server. Forces accessMode to CLOSED. */
	allowedUserIds?: string[];
}
