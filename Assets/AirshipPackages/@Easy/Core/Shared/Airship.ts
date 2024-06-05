import { AirshipPartyController } from "../Client/Controllers/Airship/Party/AirshipPartyController";
import { AirshipPlatformInventoryController } from "../Client/Controllers/Airship/PlatformInventory/AirshipPlatformInventoryController";
import { AirshipUserController } from "../Client/Controllers/Airship/User/AirshipUserController";
import { AirshipCacheStoreService } from "../Server/Services/Airship/CacheStore/AirshipCacheStoreService";
import { AirshipDataStoreService } from "../Server/Services/Airship/DataStore/AirshipDataStoreService";
import { AirshipLeaderboardService } from "../Server/Services/Airship/Leaderboard/AirshipLeaderboardService";
import { AirshipPartyService } from "../Server/Services/Airship/Party/AirshipPartyService";
import { AirshipPlatformInventoryService } from "../Server/Services/Airship/PlatformInventory/AirshipPlatformInventoryService";
import { AirshipTransferService } from "../Server/Services/Airship/Transfer/AirshipTransferService";
import { AirshipUserService } from "../Server/Services/Airship/User/AirshipUserService";
import { AirshipCharacterCameraSingleton } from "./Camera/AirshipCharacterCameraSingleton";
import { CharactersSingleton } from "./Character/CharactersSingleton";
import { AirshipChatSingleton } from "./Chat/AirshipChatSingleton";
import { DamageSingleton } from "./Damage/DamageSingleton";
import { OnStart } from "./Flamework";
import { AirshipInputSingleton } from "./Input/AirshipInputSingleton";
import { InventorySingleton } from "./Inventory/InventorySingleton";
import { LoadingScreenSingleton } from "./LoadingScreen/LoadingScreenSingleton";
import { PlayersSingleton } from "./Player/PlayersSingleton";
import { TagsSingleton } from "./Tags/TagsSingleton";
import { TeamsSingleton } from "./Team/TeamSingleton";

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
		cacheStore: undefined as unknown as Omit<AirshipCacheStoreService, "OnStart">,
		/**
		 * The Data Store provides simple key/value persistent storage.
		 *
		 * The data store provides durable storage that can be accessed from any game server. Data access is slower than
		 * the Cache Store, but the data will never expire.
		 *
		 * The Data Store is good for things like user profiles or unlocks. If you want to keep track of user statistics or
		 * build tradable inventory, check out the Leaderboard and PlatformInventory systems.s
		 */
		dataStore: undefined as unknown as Omit<AirshipDataStoreService, "OnStart">,
		/**
		 * This service provides access to leaderboard information as well as methods for updating existing leaderboards.
		 * Leaderboards must be created using the https://create.airship.gg website. Once a leaderboard is created, it can be
		 * accessed using the name provided during setup.
		 */
		leaderboard: undefined as unknown as Omit<AirshipLeaderboardService, "OnStart">,
		/**
		 * Allows access to player party information.
		 */
		party: undefined as unknown as Omit<AirshipPartyService, "OnStart">,
		/**
		 * The transfer service allows you to move players between servers and create new servers.
		 */
		transfer: undefined as unknown as Omit<AirshipTransferService, "OnStart">,
		/**
		 * Provides access to user information.
		 */
		user: undefined as unknown as Omit<AirshipUserService, "OnStart">,
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
		inventory: undefined as unknown as Omit<AirshipPlatformInventoryService, "OnStart">,
	},
	/**
	 * Client accessible services.
	 */
	client: {
		/**
		 * This controller provides information about the users current party.
		 */
		party: undefined as unknown as Omit<AirshipPartyController, "OnStart">,
		/**
		 * This controller allows access to the current players platform inventory. Platform inventory
		 * is managed by game servers and configured on the https://create.airship.gg website.
		 */
		inventory: undefined as unknown as Omit<AirshipPlatformInventoryController, "OnStart">,
		/**
		 * Provides access to user information.
		 */
		user: undefined as unknown as Omit<AirshipUserController, "OnStart">,
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
	characterCamera: undefined as unknown as Omit<AirshipCharacterCameraSingleton, "OnStart">,
	/**
	 * Namespace for managing and query Airship tags on game objects
	 * @see https://docs.airship.gg/tags
	 */
	tags: undefined! as Omit<TagsSingleton, keyof OnStart>,

	chat: undefined as unknown as Omit<AirshipChatSingleton, "OnStart">,

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
