/** Base transfer configuration that all transfer requests can include */
interface AishipBaseTransferConfig {
	/** JSON encodable object that will be provided to the server being joined */
	serverTransferData?: unknown;
	/** JSON encodable object that will be provided to the client on transfer */
	clientTransferData?: unknown;
	/**
	 * Loading screen image to be used. You can upload loading screen images on https://create.airship.gg/
	 * This parameter will be ignored if you are transferring players to another game.
	 */
	loadingScreenImageId?: string;
}

/** Configuration for Airship transfers to games. */
export interface AirshipGameTransferConfig extends AishipBaseTransferConfig {
	/**
	 * The preferred server to transfer to. If transfering to this server is not possible or it does not match the other
	 * requested parameters, a different server will be selected.
	 */
	preferredServerId?: string;
}

/**
 * Configuration for Airship transfers to matching servers. If a configuration parameter is left undefined, any value will be accepted
 * for that parameter.
 */
export interface AirshipMatchingServerTransferConfig extends AishipBaseTransferConfig {
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
}

/** Configuration for Airship transfers to a target player. */
export interface AirshipPlayerTransferConfig extends AishipBaseTransferConfig {}

/** Configuration for Airship transfers to specific game servers. */
export interface AirshipServerTransferConfig extends AishipBaseTransferConfig {}
