import {
	ClientBridgeApiGetFriendServers,
	ClientBridgeApiGetServerList,
	ServerListControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/ServerList/ProtectedServerListController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { ServerListEntry, ServerListEntryWithFriends } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipServerList";
import { ContextBridgeUtil } from "@Easy/Core/Shared/Airship/Util/ContextBridgeUtil";
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
	public async GetServerList(page: number = 0): Promise<{ entries: ServerListEntry[] }> {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ClientBridgeApiGetServerList>(
			ServerListControllerBridgeTopics.GetServerList,
			LuauContext.Protected,
		);
		if (!result.success) throw result.error;
		return result.data;
	}

	/**
	 * Gets servers friends of this user are on. Only listed servers are returned.
	 */
	public async GetFriendServers(): Promise<{ entries: ServerListEntryWithFriends[] }> {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ClientBridgeApiGetFriendServers>(
			ServerListControllerBridgeTopics.GetFriendServers,
			LuauContext.Protected,
		);
		if (!result.success) throw result.error;
		return result.data;
	}
}
