import {
	ServerBridgeApiAddAllowedPlayer,
	ServerBridgeApiAddTag,
	ServerBridgeApiCreateServer,
	ServerBridgeApiDelistServer,
	ServerBridgeApiGetAllowedPlayers,
	ServerBridgeApiGetGameConfig,
	ServerBridgeApiGetRegions,
	ServerBridgeApiGetServerList,
	ServerBridgeApiGetServers,
	ServerBridgeApiGetTags,
	ServerBridgeApiHasAllowedPlayer,
	ServerBridgeApiHasTag,
	ServerBridgeApiListServer,
	ServerBridgeApiRemoveAllowedPlayer,
	ServerBridgeApiRemoveTag,
	ServerBridgeApiSetAccessMode,
	ServerManagerServiceBridgeTopics,
} from "@Easy/Core/Server/ProtectedServices/Airship/ServerManager/ProtectedServerManagerService";
import { Platform } from "@Easy/Core/Shared/Airship";
import {
	AirshipServerAccessMode,
	AirshipServerConfig,
} from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipServerManager";
import { AirshipServerData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipServerManager";
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
	public async CreateServer(config?: AirshipServerConfig): Promise<AirshipServerData> {
		return contextbridge.invoke<ServerBridgeApiCreateServer>(
			ServerManagerServiceBridgeTopics.CreateServer,
			LuauContext.Protected,
			config,
		);
	}

	/**
	 * Gets data about a given server ID.
	 * @param serverId The server ID to retrieve
	 * @returns The server data if it exists. Returns undefined if the server could not be found.
	 */
	public async GetServer(serverId: string): Promise<AirshipServerData | undefined> {
		const result = await this.GetServers([serverId]);
		return result[serverId];
	}

	/**
	 * Gets data about the given server IDs.
	 * @param serverIds An array of server IDs to retrieve
	 * @returns A map of server ID to server data. If the server could not be found, it will not be included in the map.
	 */
	public async GetServers(serverIds: string[]): Promise<{ [serverId: string]: AirshipServerData | undefined }> {
		return contextbridge.invoke<ServerBridgeApiGetServers>(
			ServerManagerServiceBridgeTopics.GetServers,
			LuauContext.Protected,
			serverIds,
		);
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
		return contextbridge.invoke<ServerBridgeApiListServer>(
			ServerManagerServiceBridgeTopics.ListServer,
			LuauContext.Protected,
			config,
		);
	}

	/**
	 * Unlists the server if it has been listed. No change is made if the server is not listed.
	 */
	public async DelistServer(): Promise<boolean> {
		return contextbridge.invoke<ServerBridgeApiDelistServer>(
			ServerManagerServiceBridgeTopics.DelistServer,
			LuauContext.Protected,
		);
	}

	/**
	 * Gets a page of the server list.
	 * @param page The page to retrieve. Starts at 0.
	 */
	public async GetServerList(page: number = 0): Promise<{ entries: AirshipServerData[] }> {
		return contextbridge.invoke<ServerBridgeApiGetServerList>(
			ServerManagerServiceBridgeTopics.GetServerList,
			LuauContext.Protected,
		);
	}

	/**
	 * Updates the access mode of the server.
	 */
	public async SetAccessMode(mode: AirshipServerAccessMode): Promise<boolean> {
		return contextbridge.invoke<ServerBridgeApiSetAccessMode>(
			ServerManagerServiceBridgeTopics.SetAccessMode,
			LuauContext.Protected,
			mode,
		);
	}

	/**
	 * Retrieves the game config passed to this server in the {@link AirshipServerManagerService.CreateServer} function. If
	 * the configuration cannot be parsed or does not exist, returns undefined.
	 * @returns The game configuration object or undefined.
	 */
	public GetGameConfig<T>(): T | undefined {
		return contextbridge.invoke<ServerBridgeApiGetGameConfig<T>>(
			ServerManagerServiceBridgeTopics.GetGameConfig,
			LuauContext.Protected,
		);
	}

	/**
	 * Gets the user IDs of players that are allowed on this server. An empty array indicates that all
	 * players are allowed.
	 * @returns The userIds of all players allowed to join this server.
	 */
	public async GetAllowedPlayers(): Promise<Readonly<string[]>> {
		return contextbridge.invoke<ServerBridgeApiGetAllowedPlayers>(
			ServerManagerServiceBridgeTopics.GetAllowedPlayers,
			LuauContext.Protected,
		);
	}

	/**
	 * Checks if the provided userId is allowed on the server.
	 * @param userId The userId of the player.
	 * @returns True if allowed, false otherwise.
	 */
	public async HasAllowedPlayer(userId: string): Promise<boolean> {
		return contextbridge.invoke<ServerBridgeApiHasAllowedPlayer>(
			ServerManagerServiceBridgeTopics.HasAllowedPlayer,
			LuauContext.Protected,
			userId,
		);
	}

	/**
	 * Adds a userId to the allowed player list. You can get the current allowed players list with
	 * {@link AirshipServerManager.GetAllowedPlayers}.
	 * @param userId The userId of the player.
	 * @returns True if the userId was added, false otherwise.
	 */
	public async AddAllowedPlayer(userId: string): Promise<boolean> {
		return contextbridge.invoke<ServerBridgeApiAddAllowedPlayer>(
			ServerManagerServiceBridgeTopics.AddAllowedPlayer,
			LuauContext.Protected,
			userId,
		);
	}

	/**
	 * Removes a userId from the allowed player list. If the allowed players list is empty, all players will
	 * be allowed to join. You can get the current allowed players list with {@link AirshipServerManager.GetAllowedPlayers}.
	 * @param userId The userId of the player
	 * @returns True if the userId was removed, false otherwise.
	 */
	public async RemoveAllowedPlayer(userId: string): Promise<boolean> {
		return contextbridge.invoke<ServerBridgeApiRemoveAllowedPlayer>(
			ServerManagerServiceBridgeTopics.RemoveAllowedPlayer,
			LuauContext.Protected,
			userId,
		);
	}

	/**
	 * Gets the tags on this server.
	 * @returns The tags on this server.
	 */
	public async GetTags(): Promise<Readonly<string[]>> {
		return contextbridge.invoke<ServerBridgeApiGetTags>(
			ServerManagerServiceBridgeTopics.GetTags,
			LuauContext.Protected,
		);
	}

	/**
	 * Checks if the provided tag exists on the server.
	 * @param tag The tag to check for.
	 * @returns True if the tag exists, false otherwise.
	 */
	public async HasTag(tag: string): Promise<boolean> {
		return contextbridge.invoke<ServerBridgeApiHasTag>(
			ServerManagerServiceBridgeTopics.HasTag,
			LuauContext.Protected,
			tag,
		);
	}

	/**
	 * Adds a tag to server.
	 * @param tag The tag to add.
	 * @returns True if the tag was added, false otherwise.
	 */
	public async AddTag(tag: string): Promise<boolean> {
		return contextbridge.invoke<ServerBridgeApiAddTag>(
			ServerManagerServiceBridgeTopics.AddTag,
			LuauContext.Protected,
			tag,
		);
	}

	/**
	 * Removes a tag from the server.
	 * @param tag The tag to remove.
	 * @returns True if the tag was removed, false otherwise.
	 */
	public async RemoveTag(tag: string): Promise<boolean> {
		return contextbridge.invoke<ServerBridgeApiRemoveTag>(
			ServerManagerServiceBridgeTopics.RemoveTag,
			LuauContext.Protected,
			tag,
		);
	}

	/**
	 * Gets the available regionIds for game servers. Available regions may change periodically.
	 * @returns
	 */
	public async GetRegions() {
		return contextbridge.invoke<ServerBridgeApiGetRegions>(
			ServerManagerServiceBridgeTopics.GetRegions,
			LuauContext.Protected,
		).regionIds;
	}
}
