import { AirshipServerAccessMode, AirshipServerConfig } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipTransfers";
import { AirshipServerData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipServerManager";
import { Dependency, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { ShutdownService } from "../../Shutdown/ShutdownService";

export const enum ServerManagerServiceBridgeTopics {
	CreateServer = "ServerManagerService:CreateServer",
	GetServers = "ServerManagerService:GetServers",
	ShutdownServer = "ServerManagerService:ShutdownServer",
	ListServer = "ServerManagerService:ListServer",
	DelistServer = "ServerManagerService:UnlistServer",
	GetServerList = "ServerManagerService:GetServerList",
	SetAccessMode = "ServerManagerService:SetAccessMode",
}

export type ServerBridgeApiCreateServer = (config?: AirshipServerConfig) => Result<AirshipServerData, string>;
export type ServerBridgeApiGetServers = (
	serverIds: string[],
) => Result<{ [serverId: string]: AirshipServerData | undefined }, string>;
export type ServerBridgeApiShutdownServer = () => Result<undefined, string>;
export type ServerBridgeApiListServer = (config?: { name?: string; description?: string }) => Result<boolean, string>;
export type ServerBridgeApiDelistServer = () => Result<boolean, string>;
export type ServerBridgeApiGetServerList = (page?: number) => Result<{ entries: AirshipServerData[] }, string>;
export type ServerBridgeApiSetAccessMode = (mode: AirshipServerAccessMode) => Result<boolean, string>;

@Service({})
export class ProtectedServerManagerService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiCreateServer>(
			ServerManagerServiceBridgeTopics.CreateServer,
			(_, config) => {
				const [success, result] = this.CreateServer(config).await();
				if (!success) {
					return { success: false, error: "Unable to complete request." };
				}
				return result;
			},
		);

		contextbridge.callback<ServerBridgeApiGetServers>(
			ServerManagerServiceBridgeTopics.GetServers,
			(_, serverIds) => {
				const [success, result] = this.GetServers(serverIds).await();
				if (!success) {
					return { success: false, error: "Unable to complete request." };
				}
				return result;
			},
		);

		contextbridge.callback<ServerBridgeApiShutdownServer>(ServerManagerServiceBridgeTopics.ShutdownServer, () => {
			Dependency<ShutdownService>().Shutdown();
			return { success: true, data: undefined };
		});

		contextbridge.callback<ServerBridgeApiListServer>(ServerManagerServiceBridgeTopics.ListServer, (_, config) => {
			const [success, result] = this.ListServer(config).await();
			if (!success) {
				return { success: false, error: "Unable to complete request." };
			}
			return result;
		});

		contextbridge.callback<ServerBridgeApiDelistServer>(ServerManagerServiceBridgeTopics.DelistServer, (_) => {
			const [success, result] = this.DelistServer().await();
			if (!success) {
				return { success: false, error: "Unable to complete request." };
			}
			return result;
		});

		contextbridge.callback<ServerBridgeApiGetServerList>(ServerManagerServiceBridgeTopics.GetServerList, (_) => {
			const [success, result] = this.GetServerList().await();
			if (!success) {
				return { success: false, error: "Unable to complete request." };
			}
			return result;
		});

		contextbridge.callback<ServerBridgeApiSetAccessMode>(
			ServerManagerServiceBridgeTopics.SetAccessMode,
			(_, mode) => {
				const [success, result] = this.SetAccessMode(mode).await();
				if (!success) {
					return { success: false, error: "Unable to complete request." };
				}
				return result;
			},
		);
	}

	public async CreateServer(config?: AirshipServerConfig): Promise<ReturnType<ServerBridgeApiCreateServer>> {
		const res = InternalHttpManager.PostAsync(
			`${AirshipUrl.GameCoordinator}/servers/create`,
			EncodeJSON({
				sceneId: config?.sceneId,
				region: config?.region,
				accessMode: config?.accessMode,
				allowedUids: config?.allowedUserIds,
				maxPlayers: config?.maxPlayers,
				tags: config?.tags,
			}),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to create server. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				error: res.error,
			};
		}

		return {
			success: true,
			data: DecodeJSON<AirshipServerData>(res.data),
		};
	}

	public async GetServers(serverIds: string[]): Promise<ReturnType<ServerBridgeApiGetServers>> {
		if (serverIds.size() === 0) {
			return {
				success: true,
				data: {},
			};
		}

		const res = InternalHttpManager.GetAsync(
			`${AirshipUrl.GameCoordinator}/servers?serverIds[]=${serverIds.join("&serverIds[]=")}`,
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get servers. Status Code:  ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: res.error,
			};
		}

		if (!res.data) {
			return {
				success: true,
				data: {},
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	public async ListServer(config?: {
		name?: string;
		description?: string;
	}): Promise<ReturnType<ServerBridgeApiListServer>> {
		if (config?.name) await AgonesCore.Agones.SetAnnotation("ServerListName", config.name);
		if (config?.description) await AgonesCore.Agones.SetAnnotation("ServerListDesc", config.description);

		const res = await AgonesCore.Agones.SetAnnotation("ServerListActive", "true");
		return {
			success: true,
			data: res,
		};
	}

	public async DelistServer(): Promise<ReturnType<ServerBridgeApiDelistServer>> {
		const res = await AgonesCore.Agones.SetAnnotation("ServerListActive", "false");
		return {
			success: true,
			data: res,
		};
	}

	public async GetServerList(page: number = 0): Promise<ReturnType<ServerBridgeApiGetServerList>> {
		const res = InternalHttpManager.GetAsync(
			`${AirshipUrl.GameCoordinator}/servers/game-id/${Game.gameId}/list?page=${page}`,
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get server list. Status Code:  ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: res.error,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data) as { entries: AirshipServerData[] },
		};
	}

	public async SetAccessMode(mode: AirshipServerAccessMode): Promise<ReturnType<ServerBridgeApiSetAccessMode>> {
		const res = await AgonesCore.Agones.SetLabel("AccessMode", mode);
		return { success: true, data: res };
	}

	protected OnStart(): void {}
}
