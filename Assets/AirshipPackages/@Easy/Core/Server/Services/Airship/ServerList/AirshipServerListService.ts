import {
	ServerBridgeApiGetServerList,
	ServerBridgeApiListServer,
	ServerBridgeApiUnlistServer,
	ServerListServiceBridgeTopics,
} from "@Easy/Core/Server/ProtectedServices/Airship/ServerList/ProtectedServerListService";
import { Platform } from "@Easy/Core/Shared/Airship";
import { ServerListEntry } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipServerList";
import { ContextBridgeUtil } from "@Easy/Core/Shared/Airship/Util/ContextBridgeUtil";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

/**
 * Allows access to player party information.
 */
@Service({})
export class AirshipServerListService {
	constructor() {
		if (!Game.IsServer()) return;

		Platform.Server.ServerList = this;
	}

	protected OnStart(): void {}

	/**
	 * Lists the current server on the games server list. You can optionally specify a name and description
	 * to be passed through to the server list.
	 * @param config The list configuration to use. Name and description will be passed to the server list data.
	 * @returns True if the server was successfully listed.
	 */
	public async ListServer(config?: { name?: string; description?: string }): Promise<boolean> {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiListServer>(
			ServerListServiceBridgeTopics.ListServer,
			LuauContext.Protected,
			config,
		);
		if (!result.success) throw result.error;
		return result.data;
	}

	/**
	 * Unlists the server if it has been listed. No change is made if the server is not listed.
	 */
	public async UnlistServer() {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiUnlistServer>(
			ServerListServiceBridgeTopics.UnlistServer,
			LuauContext.Protected,
		);
		if (!result.success) throw result.error;
		return result.data;
	}

	/**
	 * Gets a page of the server list.
	 * @param page The page to retrieve. Starts at 0.
	 */
	public async GetServerList(page: number = 0): Promise<{ entries: ServerListEntry[] }> {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiGetServerList>(
			ServerListServiceBridgeTopics.GetServerList,
			LuauContext.Protected,
		);
		if (!result.success) throw result.error;
		return result.data;
	}
}
