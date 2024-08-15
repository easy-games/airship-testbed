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
	/** The access mode of the server. Defaults to OPEN on the default scene, and DIRECT_JOIN on any other scene. */
	accessMode?: AirshipServerAccessMode;
	/** The region the game server should be started in. Defaults to the same region as the server that makes the create request. */
	region?: string;
	/** The max players setting for the server. If not set, the default for the game is used. You can change the default for your game on https://create.airship.gg */
	maxPlayers?: string;
	/** Only allow the players in this list to join the server. Forces accessMode to CLOSED. */
	allowedUserIds?: string[];
	/** An array of tags to associate with this server. You can have up to 100 tags. */
	tags?: string[];
}

/** Configuration for Airship transfers to games. */
export interface AirshipGameTransferConfig {
	/**
	 * The preferred server to transfer to. If transfering to this server is not possible or it does not match the other
	 * requested parameters, a different server will be selected.
	 */
	preferredServerId?: string;
	/** JSON encodable object that will be provided to the server being joined */
	serverTransferData?: unknown;
	/** JSON encodable object that will be provided to the client on transfer */
	clientTransferData?: unknown;
}

/**
 * Configuration for Airship transfers to matching servers. If a configuration parameter is left undefined, any value will be accepted
 * for that parameter.
 */
export interface AirshipMatchingServerTransferConfig {
	/**
	 * The sceneId to transfer the player to. Note that this is based on the scene the server was _started_ with,
	 * not it's currently active scene.
	 */
	sceneId?: string;
	/**
	 * The server max players. If this field is present, a game server with this max players value will be selected.
	 */
	maxPlayers?: number;
	/**
	 * The regions to find a game server in. If this field is not present, the best regions to search will be selected based on
	 * the players being transfered.
	 */
	regions?: string[];
	/**
	 * A tag to match. Only servers that contain this tag in their tag list will be selected.
	 */
	tag?: string;
	/**
	 * The access mode of the server. Only servers with this access mode will be selected.
	 */
	accessMode?: AccessMode;
	/** JSON encodable object that will be provided to the server being joined */
	serverTransferData?: unknown;
	/** JSON encodable object that will be provided to the client on transfer */
	clientTransferData?: unknown;
}

export interface AirshipPlayerTransferConfig {
	/** JSON encodable object that will be provided to the server being joined */
	serverTransferData?: unknown;
	/** JSON encodable object that will be provided to the client on transfer */
	clientTransferData?: unknown;
}

/** Configuration for Airship transfers to specific game servers. */
export interface AirshipServerTransferConfig {
	/** JSON encodable object that will be provided to the server being joined */
	serverTransferData?: unknown;
	/** JSON encodable object that will be provided to the client on transfer */
	clientTransferData?: unknown;
}
