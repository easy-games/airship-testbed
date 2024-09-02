import {
	ServerBridgeApiCreateServer,
	ServerBridgeApiDelistServer,
	ServerBridgeApiGetServerList,
	ServerBridgeApiListServer,
	ServerManagerServiceBridgeTopics,
} from "@Easy/Core/Server/ProtectedServices/Airship/ServerManager/ProtectedServerManagerService";
import { Platform } from "@Easy/Core/Shared/Airship";
import { AirshipServerConfig } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipTransfers";
import { ServerListEntry } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipServerList";
import { CreateServerResponse } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipTransfers";
import { ContextBridgeUtil } from "@Easy/Core/Shared/Airship/Util/ContextBridgeUtil";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

/**
 * Allows access to and modification of the game server list.
 */
@Service({})
export class AirshipServerManagerService {
	constructor() {
		if (!Game.IsServer()) return;

		Platform.Server.ServerManager = this;
	}

	protected OnStart(): void {}

	/**
	 * Creates a new server and returns a server id which can be used to transfer players to the new server.
	 * @param config The configuration the server should start with. If not provided, the server will use the defaults
	 * provided during deployment.
	 * @returns The id of the new server. Undefined if the server was not able to be created.
	 */
	public async CreateServer(config?: AirshipServerConfig): Promise<CreateServerResponse> {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiCreateServer>(
			ServerManagerServiceBridgeTopics.CreateServer,
			LuauContext.Protected,
			config,
		);
		if (!result.success) throw result.error;
		return result.data;
	}

	/**
	 * Shuts down the current server. All players will be transferred off of the server before shutting down.
	 */
	public ShutdownServer() {
		contextbridge.invoke(ServerManagerServiceBridgeTopics.ShutdownServer, LuauContext.Protected);
	}

	/**
	 * Lists the current server on the games server list. You can optionally specify a name and description
	 * to be passed through to the server list.
	 * @param config The list configuration to use. Name and description will be passed to the server list data.
	 * @returns True if the server was successfully listed.
	 */
	public async ListServer(config?: { name?: string; description?: string }): Promise<boolean> {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiListServer>(
			ServerManagerServiceBridgeTopics.ListServer,
			LuauContext.Protected,
			config,
		);
		if (!result.success) throw result.error;
		return result.data;
	}

	/**
	 * Unlists the server if it has been listed. No change is made if the server is not listed.
	 */
	public async DelistServer() {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiDelistServer>(
			ServerManagerServiceBridgeTopics.DelistServer,
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
			ServerManagerServiceBridgeTopics.GetServerList,
			LuauContext.Protected,
		);
		if (!result.success) throw result.error;
		return result.data;
	}
}
