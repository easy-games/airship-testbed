import {
	ClientBridgeApiGetFriendServers,
	ClientBridgeApiGetServerList,
	ServerListControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/ServerList/ProtectedServerListController";
import { Platform } from "@Easy/Core/Shared/Airship";
import {
	AirshipServerData,
	ServerListEntryWithFriends,
} from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipServerManager";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

/**
 * Allows access to the game server list.
 */
@Service({})
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
	public async GetServerList(page: number = 0): Promise<{ entries: AirshipServerData[] }> {
		return contextbridge.invoke<ClientBridgeApiGetServerList>(
			ServerListControllerBridgeTopics.GetServerList,
			LuauContext.Protected,
		);
	}

	/**
	 * Gets servers friends of this user are on. Only listed servers are returned.
	 */
	public async GetFriendServers(): Promise<{ entries: ServerListEntryWithFriends[] }> {
		return contextbridge.invoke<ClientBridgeApiGetFriendServers>(
			ServerListControllerBridgeTopics.GetFriendServers,
			LuauContext.Protected,
		);
	}
}
