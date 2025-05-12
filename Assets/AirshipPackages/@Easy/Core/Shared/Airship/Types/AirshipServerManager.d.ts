import { GameCoordinatorServers } from "../../TypePackages/game-coordinator-types";

/** Configuration for an Airship server. */
export interface AirshipServerConfig {
	/** The scene the server will start on. Defaults to the scene provided during deployment. */
	sceneId?: string;
	/** The access mode of the server. Defaults to OPEN on the default scene, and DIRECT_JOIN on any other scene. */
	accessMode?: GameCoordinatorServers.AccessMode;
	/** The region the game server should be started in. Defaults to the same region as the server that makes the create request. */
	region?: string;
	/** The max players setting for the server. If not set, the default for the game is used. You can change the default for your game on https://create.airship.gg */
	maxPlayers?: number;
	/** Only allow the players in this list to join the server. */
	allowedUserIds?: string[];
	/** An array of tags to associate with this server. You can have up to 100 tags. */
	tags?: string[];
	/** An object representing game configuration to be passed to the created server. */
	gameConfig?: object;
	/** The fleet the game server will use. This determines the performance characteristics of the underlying server host. */
	fleet?: GameCoordinatorServers.AgonesFleet;
}
