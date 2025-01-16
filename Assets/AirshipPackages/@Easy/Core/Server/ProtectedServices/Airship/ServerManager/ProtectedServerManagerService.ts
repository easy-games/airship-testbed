import {
	AirshipServerAccessMode,
	AirshipServerConfig,
} from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipServerManager";
import { AirshipServerData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipServerManager";
import { Dependency, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { ShutdownService } from "../../Shutdown/ShutdownService";
import { RetryHttp } from "@Easy/Core/Shared/Http/HttpRetry";

export const enum ServerManagerServiceBridgeTopics {
	CreateServer = "ServerManagerService:CreateServer",
	GetServers = "ServerManagerService:GetServers",
	ShutdownServer = "ServerManagerService:ShutdownServer",
	ListServer = "ServerManagerService:ListServer",
	DelistServer = "ServerManagerService:UnlistServer",
	GetServerList = "ServerManagerService:GetServerList",
	SetAccessMode = "ServerManagerService:SetAccessMode",
	GetGameConfig = "ServerManagerService:GetGameConfig",
	GetAllowedPlayers = "ServerManagerService:GetAllowedPlayers",
	AddAllowedPlayer = "ServerManagerService:AddAllowedPlayer",
	RemoveAllowedPlayer = "ServerManagerService:RemoveAllowedPlayer",
	HasAllowedPlayer = "ServerManagerService:HasAllowedPlayer",
	GetTags = "ServerManagerService:GetTags",
	HasTag = "ServerManagerService:HasTag",
	AddTag = "ServerManagerService:AddTag",
	RemoveTag = "ServerManagerService:RemoveTag",
}

export type ServerBridgeApiCreateServer = (config?: AirshipServerConfig) => AirshipServerData;
export type ServerBridgeApiGetServers = (serverIds: string[]) => { [serverId: string]: AirshipServerData | undefined };
export type ServerBridgeApiShutdownServer = () => void;
export type ServerBridgeApiListServer = (config?: { name?: string; description?: string }) => boolean;
export type ServerBridgeApiDelistServer = () => boolean;
export type ServerBridgeApiGetServerList = (page?: number) => { entries: AirshipServerData[] };
export type ServerBridgeApiSetAccessMode = (mode: AirshipServerAccessMode) => boolean;
export type ServerBridgeApiGetGameConfig<T> = () => T | undefined;
export type ServerBridgeApiGetAllowedPlayers = () => string[];
export type ServerBridgeApiHasAllowedPlayer = (userId: string) => boolean;
export type ServerBridgeApiAddAllowedPlayer = (userId: string) => boolean;
export type ServerBridgeApiRemoveAllowedPlayer = (userId: string) => boolean;
export type ServerBridgeApiGetTags = () => string[];
export type ServerBridgeApiHasTag = (tag: string) => boolean;
export type ServerBridgeApiAddTag = (tag: string) => boolean;
export type ServerBridgeApiRemoveTag = (tag: string) => boolean;

const ALLOWED_PLAYERS_LIST_KEY = "allowedPlayers";
const TAGS_LIST_KEY = "tags";

@Service({})
export class ProtectedServerManagerService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiCreateServer>(
			ServerManagerServiceBridgeTopics.CreateServer,
			(_, config) => {
				return this.CreateServer(config).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiGetServers>(
			ServerManagerServiceBridgeTopics.GetServers,
			(_, serverIds) => {
				return this.GetServers(serverIds).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiShutdownServer>(ServerManagerServiceBridgeTopics.ShutdownServer, () => {
			Dependency<ShutdownService>().Shutdown();
			return { success: true, data: undefined };
		});

		contextbridge.callback<ServerBridgeApiListServer>(ServerManagerServiceBridgeTopics.ListServer, (_, config) => {
			return this.ListServer(config).expect();
		});

		contextbridge.callback<ServerBridgeApiDelistServer>(ServerManagerServiceBridgeTopics.DelistServer, (_) => {
			return this.DelistServer().expect();
		});

		contextbridge.callback<ServerBridgeApiGetServerList>(ServerManagerServiceBridgeTopics.GetServerList, (_) => {
			return this.GetServerList().expect();
		});

		contextbridge.callback<ServerBridgeApiSetAccessMode>(
			ServerManagerServiceBridgeTopics.SetAccessMode,
			(_, mode) => {
				return this.SetAccessMode(mode).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiGetGameConfig<unknown>>(
			ServerManagerServiceBridgeTopics.GetGameConfig,
			(_) => {
				return this.GetGameConfig();
			},
		);

		contextbridge.callback<ServerBridgeApiGetAllowedPlayers>(
			ServerManagerServiceBridgeTopics.GetAllowedPlayers,
			(_) => {
				return this.GetAllowedPlayers().expect();
			},
		);

		contextbridge.callback<ServerBridgeApiHasAllowedPlayer>(
			ServerManagerServiceBridgeTopics.HasAllowedPlayer,
			(_, userId) => {
				return this.HasAllowedPlayer(userId).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiAddAllowedPlayer>(
			ServerManagerServiceBridgeTopics.AddAllowedPlayer,
			(_, userId) => {
				return this.AddAllowedPlayer(userId).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiRemoveAllowedPlayer>(
			ServerManagerServiceBridgeTopics.RemoveAllowedPlayer,
			(_, userId) => {
				return this.RemoveAllowedPlayer(userId).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiGetTags>(ServerManagerServiceBridgeTopics.GetTags, (_) => {
			return this.GetTags().expect();
		});

		contextbridge.callback<ServerBridgeApiAddTag>(ServerManagerServiceBridgeTopics.HasTag, (_, tag) => {
			return this.HasTag(tag).expect();
		});

		contextbridge.callback<ServerBridgeApiAddTag>(ServerManagerServiceBridgeTopics.AddTag, (_, tag) => {
			return this.AddTag(tag).expect();
		});

		contextbridge.callback<ServerBridgeApiRemoveTag>(ServerManagerServiceBridgeTopics.RemoveTag, (_, tag) => {
			return this.RemoveTag(tag).expect();
		});
	}

	public async CreateServer(config?: AirshipServerConfig): Promise<ReturnType<ServerBridgeApiCreateServer>> {
		const res = await RetryHttp(
			() => InternalHttpManager.PostAsync(
				`${AirshipUrl.GameCoordinator}/servers/create`,
				json.encode({
					sceneId: config?.sceneId,
					region: config?.region,
					accessMode: config?.accessMode,
					allowedUids: config?.allowedUserIds,
					maxPlayers: config?.maxPlayers,
					tags: config?.tags,
					gameConfig: config?.gameConfig,
					fleet: config?.fleet,
				}),
			),
			{ retryKey: "post/game-coordinator/servers/create" },
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to create server. Status Code:  ${res.statusCode}.\n`, res.data);
			throw res.error;
		}

		return json.decode<AirshipServerData>(res.data) as AirshipServerData;
	}

	public async GetServers(serverIds: string[]): Promise<ReturnType<ServerBridgeApiGetServers>> {
		if (serverIds.size() === 0) {
			return {};
		}

		const res = await RetryHttp(
			() => InternalHttpManager.GetAsync(
				`${AirshipUrl.GameCoordinator}/servers?serverIds[]=${serverIds.join("&serverIds[]=")}`,
			),
			{ retryKey: "get/game-coordinator/servers" },
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get servers. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		if (!res.data) {
			return {};
		}

		return json.decode(res.data) as ReturnType<ServerBridgeApiGetServers>;
	}

	public async ListServer(config?: {
		name?: string;
		description?: string;
	}): Promise<ReturnType<ServerBridgeApiListServer>> {
		if (config?.name) await AgonesCore.Agones.SetAnnotation("ServerListName", config.name);
		if (config?.description) await AgonesCore.Agones.SetAnnotation("ServerListDesc", config.description);

		const res = await AgonesCore.Agones.SetAnnotation("ServerListActive", "true");
		return res;
	}

	public async DelistServer(): Promise<ReturnType<ServerBridgeApiDelistServer>> {
		const res = await AgonesCore.Agones.SetAnnotation("ServerListActive", "false");
		return res;
	}

	public async GetServerList(page: number = 0): Promise<ReturnType<ServerBridgeApiGetServerList>> {
		const res = await RetryHttp(
			() => InternalHttpManager.GetAsync(
				`${AirshipUrl.GameCoordinator}/servers/game-id/${Game.gameId}/list?page=${page}`,
			),
			{ retryKey: "get/game-coordinator/servers/game-id/:gameId/list" },
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get server list. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return json.decode(res.data) as { entries: AirshipServerData[] };
	}

	public async SetAccessMode(mode: AirshipServerAccessMode): Promise<ReturnType<ServerBridgeApiSetAccessMode>> {
		const res = await AgonesCore.Agones.SetLabel("AccessMode", mode);
		return res;
	}

	public GetGameConfig<T>(): ReturnType<ServerBridgeApiGetGameConfig<T>> {
		const serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>()!;
		const gs = serverBootstrap.GetGameServer();
		try {
			const gameConfigString = gs?.ObjectMeta.Annotations.Get("GameConfig");
			if (!gameConfigString) return undefined;

			const gameConfig = json.decode(gameConfigString);
			return gameConfig as T;
		} catch (err) {
			return undefined;
		}
	}

	public async GetAllowedPlayers(): Promise<ReturnType<ServerBridgeApiGetAllowedPlayers>> {
		const players = await AgonesCore.Agones.GetListValues(ALLOWED_PLAYERS_LIST_KEY);
		const userIds = [];
		for (let i = 0; i < players.Length; i++) {
			userIds.push(players.GetValue(i));
		}
		return userIds;
	}

	public async HasAllowedPlayer(userId: string): Promise<ReturnType<ServerBridgeApiHasAllowedPlayer>> {
		return await AgonesCore.Agones.ListContains(ALLOWED_PLAYERS_LIST_KEY, userId);
	}

	public async AddAllowedPlayer(userId: string): Promise<ReturnType<ServerBridgeApiAddAllowedPlayer>> {
		return await AgonesCore.Agones.AppendListValue(ALLOWED_PLAYERS_LIST_KEY, userId);
	}

	public async RemoveAllowedPlayer(userId: string): Promise<ReturnType<ServerBridgeApiRemoveAllowedPlayer>> {
		return await AgonesCore.Agones.DeleteListValue(ALLOWED_PLAYERS_LIST_KEY, userId);
	}

	public async GetTags(): Promise<ReturnType<ServerBridgeApiGetTags>> {
		const tags = await AgonesCore.Agones.GetListValues(TAGS_LIST_KEY);
		const tagValues = [];
		for (let i = 0; i < tags.Length; i++) {
			tagValues.push(tags.GetValue(i));
		}
		return tagValues;
	}

	public async HasTag(tag: string): Promise<ReturnType<ServerBridgeApiHasTag>> {
		return await AgonesCore.Agones.ListContains(TAGS_LIST_KEY, tag);
	}

	public async AddTag(tag: string): Promise<ReturnType<ServerBridgeApiAddTag>> {
		return await AgonesCore.Agones.AppendListValue(TAGS_LIST_KEY, tag);
	}

	public async RemoveTag(tag: string): Promise<ReturnType<ServerBridgeApiRemoveTag>> {
		return await AgonesCore.Agones.DeleteListValue(TAGS_LIST_KEY, tag);
	}
}
