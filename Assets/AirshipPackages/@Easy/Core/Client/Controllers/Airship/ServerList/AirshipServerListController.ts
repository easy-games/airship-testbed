import {
	ClientBridgeApiGetFriendServers,
	ClientBridgeApiGetServerList,
	ServerListControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/ServerList/ProtectedServerListController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { GameCoordinatorServers } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";

/**
 * Allows access to the game server list.
 */
@Controller({})
export class AirshipServerListController {
	constructor() {
		if (!Game.IsClient()) return;

		Platform.Client.ServerList = this;
	}

	protected OnStart(): void {}

	/**
	 * Gets a page of the server list.
	 * @param page The page to retrieve. Starts at 0.
	 */
	public async GetServerList(page: number = 0): Promise<{ entries: GameCoordinatorServers.PublicServerData[] }> {
		return contextbridge.invoke<ClientBridgeApiGetServerList>(
			ServerListControllerBridgeTopics.GetServerList,
			LuauContext.Protected,
		);
	}

	/**
	 * Gets servers friends of this user are on. Only listed servers are returned.
	 */
	public async GetFriendServers(): Promise<{ entries: GameCoordinatorServers.ServerListEntryWithFriends[] }> {
		return contextbridge.invoke<ClientBridgeApiGetFriendServers>(
			ServerListControllerBridgeTopics.GetFriendServers,
			LuauContext.Protected,
		);
	}
}
