import { FriendsController } from "Client/Airship/Friends/FriendsController";
import { MatchmakingController } from "Client/Airship/Matchmaking/MatchmakingController";
import { PartyController } from "Client/Airship/Party/PartyController";
import { PlatformInventoryController } from "Client/Airship/PlatformInventory/PlatformInventoryController";
import { TransferController } from "Client/Airship/Transfer/TransferController";
import { UserController } from "Client/Airship/User/UserController";
import { CacheStoreService } from "Server/Airship/CacheStore/CacheStoreService";
import { DataStoreService } from "Server/Airship/DataStore/DataStoreService";
import { LeaderboardService } from "Server/Airship/Leaderboard/LeaderboardService";
import { MatchmakingService } from "Server/Airship/Matchmaking/MatchmakingService";
import { PartyService } from "Server/Airship/Party/PartyService";
import { PlatformInventoryService } from "Server/Airship/PlatformInventory/PlatformInventoryService";
import { TransferService } from "Server/Airship/Transfer/TransferService";
import { UserService } from "Server/Airship/User/UserService";
import { AirshipCharacterCameraSingleton } from "./Camera/AirshipCharacterCameraSingleton";
import { CharactersSingleton } from "./Character/CharactersSingleton";
import { DamageSingleton } from "./Damage/DamageSingleton";
import { OnStart } from "./Flamework";
import { AirshipInputSingleton } from "./Input/AirshipInputSingleton";
import { InventorySingleton } from "./Inventory/InventorySingleton";
import { LoadingScreenSingleton } from "./LoadingScreen/LoadingScreenSingleton";
import { PlayersSingleton } from "./Player/PlayersSingleton";
import { TagsSingleton } from "./Tags/TagsSingleton";
import { TeamsSingleton } from "./Team/TeamSingleton";
import { CharacterItemManager } from "./Item/HeldItems/CharacterItemManager";

/**
 * The collection of platform services available to Airship games.
 *
 * Server services will be undefined on the client. Client services will be undefined on the server.
 */
export const Platform = {
	/**
	 * Server accessible services.
	 */
	server: {
		/**
		 * The Cache Store provides simple key/value cache storage.
		 *
		 * The Cache Store provides non-durable storage that can be accessed from any game server. Data access is faster than
		 * the Data Store, but the data will expire if it is not accessed frequently enough. Cached keys can live for up to 24 hours
		 * without being accessed.
		 *
		 * The Cache Store is good for things like queue cooldowns or share codes. If you want your data to be persistent, check
		 * out the Data Store.
		 */
		cacheStore: undefined as unknown as Omit<CacheStoreService, "OnStart">,
		/**
		 * The Data Store provides simple key/value persistent storage.
		 *
		 * The data store provides durable storage that can be accessed from any game server. Data access is slower than
		 * the Cache Store, but the data will never expire.
		 *
		 * The Data Store is good for things like user configuration settings. If you want to keep track of user statistics or
		 * inventory, check out the Leaderboard and AirshipInventory systems.
		 */
		dataStore: undefined as unknown as Omit<DataStoreService, "OnStart">,
		/**
		 * This service provides access to leaderboard information as well as methods for updating existing leaderboards.
		 * Leaderboards must be created using the https://create.airship.gg website. Once a leaderboard is created, it can be
		 * accessed using the name provided during setup.
		 */
		leaderboard: undefined as unknown as Omit<LeaderboardService, "OnStart">,
		/**
		 * Allows game servers to match make players. These functions are currently only
		 * enabled upon request. Email us at hello@easy.gg to see if you might qualify.
		 */
		matchmaking: undefined as unknown as Omit<MatchmakingService, "OnStart">,
		/**
		 * Allows access to player party information.
		 */
		party: undefined as unknown as Omit<PartyService, "OnStart">,
		/**
		 * The transfer service allows you to move players between servers and create new servers.
		 */
		transfer: undefined as unknown as Omit<TransferService, "OnStart">,
		/**
		 * Provides access to user information.
		 */
		user: undefined as unknown as Omit<UserService, "OnStart">,
		/**
		 * Allows management of platform inventory for a player. These functions manipluate a persistent inventory
		 * that the player owns. Items, Accessories, and Profile Pictures are all managed by this inventory and the
		 * configurations must be registered on the https://create.airship.gg website.
		 *
		 * It is **_NOT_** recommended to use this inventory system for things like a game economy or persisting game
		 * inventory between servers. This inventory is meant to be used for items, accessories, and profile pictures that
		 * may have real money value or that players may wish to trade or sell outside of the game. This inventory is the
		 * way that the game can interact with the wider platform economy.
		 *
		 * Some examples of potential items to include in this inventory:
		 * - Weapon skins
		 * - Playable characters
		 * - Trading cards
		 * - Content purchased with real money
		 * - Content that players may want to trade or sell to other players
		 */
		inventory: undefined as unknown as Omit<PlatformInventoryService, "OnStart">,
	},
	/**
	 * Client accessible services.
	 */
	client: {
		/** Provides information about the users friends. */
		friends: undefined as unknown as Omit<FriendsController, "OnStart">,
		/** Provides access to matchmaking status. */
		matchmaking: undefined as unknown as Omit<MatchmakingController, "OnStart">,
		/**
		 * This controller provides information about the users current party.
		 */
		party: undefined as unknown as Omit<PartyController, "OnStart">,
		/**
		 * This controller allows access to the current players platform inventory. Platform inventory
		 * is managed by game servers and configured on the https://create.airship.gg website.
		 */
		inventory: undefined as unknown as Omit<PlatformInventoryController, "OnStart">,
		/**
		 * Provides access to user initiated transfer functionality.
		 */
		transfer: undefined as unknown as Omit<TransferController, "OnStart">,
		/**
		 * Provides access to user information.
		 */
		user: undefined as unknown as Omit<UserController, "OnStart">,
	},
};

export const Airship = {
	players: undefined as unknown as Omit<PlayersSingleton, "OnStart">,
	characters: undefined as unknown as Omit<CharactersSingleton, "OnStart">,
	input: undefined as unknown as Omit<AirshipInputSingleton, "OnStart">,
	damage: undefined as unknown as Omit<DamageSingleton, "OnStart">,
	teams: undefined as unknown as Omit<TeamsSingleton, "OnStart">,
	inventory: undefined as unknown as Omit<InventorySingleton, "OnStart">,
	loadingScreen: undefined as unknown as Omit<LoadingScreenSingleton, "OnStart">,
	characterCamera: undefined as unknown as AirshipCharacterCameraSingleton,
	/**
	 * Namespace for managing and query Airship tags on game objects
	 * @see https://docs.airship.gg/tags
	 */
	tags: undefined! as Omit<TagsSingleton, keyof OnStart>,

	/**
	 * Internal method used to wait until Airship singletons are ready.
	 * This is only needed when developing inside the Core package.
	 * @internal
	 */
	WaitUntilReady: () => {
		while (Airship.players === undefined) {
			task.wait();
		}
	},
};
