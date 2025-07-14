import { AirshipMatchmakingController } from "../Client/Controllers/Airship/Matchmaking/MatchmakingController";
import { AirshipPartyController } from "../Client/Controllers/Airship/Party/AirshipPartyController";
import { AirshipPlatformInventoryController } from "../Client/Controllers/Airship/PlatformInventory/AirshipPlatformInventoryController";
import { AirshipServerListController } from "../Client/Controllers/Airship/ServerList/AirshipServerListController";
import { AirshipUserController } from "../Client/Controllers/Airship/User/AirshipUserController";
import { AirshipCacheStoreService } from "../Server/Services/Airship/CacheStore/AirshipCacheStoreService";
import { AirshipDataStoreService } from "../Server/Services/Airship/DataStore/AirshipDataStoreService";
import { AirshipLeaderboardService } from "../Server/Services/Airship/Leaderboard/AirshipLeaderboardService";
import { AirshipMatchmakingService } from "../Server/Services/Airship/Matchmaking/MatchmakingService";
import { AirshipMessagingService } from "../Server/Services/Airship/Messaging/AirshipMessagingService";
import { AirshipPartyService } from "../Server/Services/Airship/Party/AirshipPartyService";
import { AirshipPlatformInventoryService } from "../Server/Services/Airship/PlatformInventory/AirshipPlatformInventoryService";
import { AirshipServerManagerService } from "../Server/Services/Airship/ServerManager/AirshipServerManagerService";
import { AirshipTransferService } from "../Server/Services/Airship/Transfer/AirshipTransferService";
import { AirshipUserService } from "../Server/Services/Airship/User/AirshipUserService";
import { AirshipAvatarSingleton } from "./Avatar/AirshipAvatarSingleton";
import { AirshipCameraSingleton } from "./Camera/AirshipCameraSingleton";
import { AirshipCharactersSingleton } from "./Character/AirshipCharactersSingleton";
import CharacterConfigSetup from "./Character/CharacterConfigSetup";
import { AirshipChatSingleton } from "./Chat/AirshipChatSingleton";
import { DamageSingleton } from "./Damage/DamageSingleton";
import { AirshipInputSingleton } from "./Input/AirshipInputSingleton";
import { AirshipInventorySingleton } from "./Inventory/AirshipInventorySingleton";
import { LoadingScreenSingleton } from "./LoadingScreen/LoadingScreenSingleton";
import { AirshipMenuSingleton } from "./Menu/AirshipMenuSingleton";
import { AirshipPlayersSingleton } from "./Player/AirshipPlayersSingleton";
import { Player } from "./Player/Player";
import { AirshipPurchaseSingleton } from "./Purchase/PurchaseSingleton";
import { AirshipSettingsSingleton } from "./Settings/AirshipSettingsSingleton";
import { TeamsSingleton } from "./Team/TeamSingleton";

/**
 * The collection of platform services available to Airship games.
 *
 * Server services will be undefined on the client. Client services will be undefined on the server.
 */
export namespace Platform {
	/**
	 * Server accessible services.
	 */
	export namespace Server {
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
		export let CacheStore = undefined! as AirshipCacheStoreService;
		/**
		 * The Data Store provides simple key/value persistent storage.
		 *
		 * The data store provides durable storage that can be accessed from any game server. Data access is slower than
		 * the Cache Store, but the data will never expire.
		 *
		 * The Data Store is good for things like user profiles or unlocks. If you want to keep track of user statistics or
		 * build tradable inventory, check out the Leaderboard and PlatformInventory systems.s
		 */
		export let DataStore = undefined! as AirshipDataStoreService;
		/**
		 * This service provides access to leaderboard information as well as methods for updating existing leaderboards.
		 * Leaderboards must be created using the https://create.airship.gg website. Once a leaderboard is created, it can be
		 * accessed using the name provided during setup.
		 */
		export let Leaderboard = undefined! as AirshipLeaderboardService;
		/**
		 * This service provides access to the airship matchmaking system.
		 * Add players to matchmaking groups and join queues to find other players to play with.
		 * Matchmaking queues must be created using the https://create.airship.gg website.
		 */
		export let Matchmaking = undefined! as AirshipMatchmakingService;
		/**
		 * Allows access to player party information.
		 */
		export let Party = undefined! as AirshipPartyService;
		/**
		 * The transfer service allows you to move players between servers and create new servers.
		 */
		export let Transfer = undefined! as AirshipTransferService;
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
		export let Inventory = undefined! as AirshipPlatformInventoryService;
		/**
		 * Allows management of the current server as well as APIs for creating and getting information about
		 * other game servers.
		 */
		export let ServerManager = undefined! as AirshipServerManagerService;
		/**
		 * Provides access to user information.
		 */
		export let User = undefined! as AirshipUserService;
		/**
		 * Provides Publish/Subscribe functionality for communicating across different game servers
		 */
		export let Messaging = undefined! as AirshipMessagingService;
	}

	/**
	 * Client accessible services.
	 */
	export namespace Client {
		/**
		 * This controller provides information about the users current party.
		 */
		export let Party = undefined! as AirshipPartyController;
		/**
		 * This controller allows access to the current players platform inventory. Platform inventory
		 * is managed by game servers and configured on the https://create.airship.gg website.
		 */
		export let Inventory = undefined! as AirshipPlatformInventoryController;
		/**
		 * Provides access to user information.
		 */
		export let User = undefined! as AirshipUserController;
		/**
		 * Provides access to a games server list.
		 */
		export let ServerList = undefined! as AirshipServerListController;
		/**
		 * Provides information about the users matchmaking status.
		 */
		export let Matchmaking = undefined! as AirshipMatchmakingController;
	}
}

/** Airship */
export namespace Airship {
	/**
	 * Players allows you to work with currently connected clients (with Airship's {@link Player} object).
	 *
	 * The local player is defined as `Game.localPlayer`
	 *
	 * If you are looking to get information about offline users see {@link Platform.Client.User}
	 */
	export let Players = undefined! as AirshipPlayersSingleton;
	/**
	 * Characters singleton provides utilities for working with the {@link Character} object.
	 *
	 * To control your game's default character see {@link CharacterConfigSetup}.
	 */
	export let Characters = undefined! as AirshipCharactersSingleton;

	/**
	 * Provides utilities for working with visual elements of a character
	 *
	 * Can be used to load outfits from the server.
	 */
	export let Avatar = undefined! as AirshipAvatarSingleton;
	/**
	 * Input singleton contains functions to work with player input (including mouse, keyboard, and touch screen).
	 * Players can rebind their action bindings in their settings menu.
	 *
	 * Ex:
	 * ```ts
	 * Airship.Input.CreateAction("Attack", Binding.MouseButton(MouseButton.LeftButton));
	 * Airship.Input.OnDown("Attack").Connect(() => {
	 * 	print("Attacked!");
	 * });
	 * ```
	 */
	export let Input = undefined! as AirshipInputSingleton;
	export let Damage = undefined! as DamageSingleton;
	export let Teams = undefined! as TeamsSingleton;
	export let Inventory = undefined! as AirshipInventorySingleton;
	/**
	 * **[Client only]**
	 *
	 * Manage the player's loading screen when joining your game. This can be useful if your game requires
	 * some work on the client before the game is ready to be played, such as spawning a map.
	 */
	export let LoadingScreen = undefined! as LoadingScreenSingleton;

	/**
	 * **[Client only]**
	 *
	 * API to control various features in the character camera sytem.
	 *
	 * `Airship.Camera` is only functional when a CameraRig.prefab is placed in your scene.
	 */
	export let Camera = undefined! as AirshipCameraSingleton;

	/**
	 * Functions for configuring the chat window as well as broadcasting messages.
	 *
	 * To send a player a message see {@link Player.SendMessage}.
	 */
	export let Chat = undefined! as AirshipChatSingleton;
	/**
	 * Provides services to manage and sell products for real money.
	 */
	export let Shop = undefined! as AirshipPurchaseSingleton;

	/**
	 * Exposes customization to the in-game Airship escape menu.
	 */
	export let Menu = undefined! as AirshipMenuSingleton;

	/**
	 * Register custom settings that show up in the settings menu.
	 */
	export let Settings = undefined! as AirshipSettingsSingleton;

	/**
	 * Internal method used to wait until Airship singletons are ready.
	 * This is only needed when developing inside the Core package.
	 * @internal
	 */
	export function WaitUntilReady() {
		while (Airship.Players === undefined) {
			task.wait();
		}
	}
}
