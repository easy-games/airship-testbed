import { AirshipServerConfig } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipTransfers";
import { ServerListEntry } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipServerList";
import { CreateServerResponse } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipTransfers";
import { Dependency, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { ShutdownService } from "../../Shutdown/ShutdownService";

export const enum ServerManagerServiceBridgeTopics {
	CreateServer = "ServerManagerService:CreateServer",
	ShutdownServer = "ServerManagerService:ShutdownServer",
	ListServer = "ServerManagerService:ListServer",
	DelistServer = "ServerManagerService:UnlistServer",
	GetServerList = "ServerManagerService:GetServerList",
}

export type ServerBridgeApiCreateServer = (config?: AirshipServerConfig) => Result<CreateServerResponse, string>;
export type ServerBridgeApiShutdownServer = () => Result<undefined, string>;
export type ServerBridgeApiListServer = (config?: { name?: string; description?: string }) => Result<boolean, string>;
export type ServerBridgeApiDelistServer = () => Result<boolean, string>;
export type ServerBridgeApiGetServerList = (page?: number) => Result<{ entries: ServerListEntry[] }, string>;

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

		if (!res.success && res.statusCode > 299) {
			warn(`Unable to create server. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				error: res.error,
			};
		}

		return {
			success: true,
			data: DecodeJSON<{
				serverId: string;
			}>(res.data),
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
			data: DecodeJSON(res.data) as { entries: ServerListEntry[] },
		};
	}

	protected OnStart(): void {}
}
