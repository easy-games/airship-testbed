import { ServerListEntry } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipServerList";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { DecodeJSON } from "@Easy/Core/Shared/json";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum ServerListServiceBridgeTopics {
	ListServer = "ServerListService:ListServer",
	UnlistServer = "ServerListService:UnlistServer",
	GetServerList = "ServerListService:GetServerList",
}

export type ServerBridgeApiListServer = (config?: { name?: string; description?: string }) => Result<boolean, string>;
export type ServerBridgeApiUnlistServer = () => Result<boolean, string>;
export type ServerBridgeApiGetServerList = (page?: number) => Result<{ entries: ServerListEntry[] }, string>;

@Service({})
export class ProtectedTransferService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiListServer>(ServerListServiceBridgeTopics.ListServer, (_, config) => {
			const [success, result] = this.ListServer(config).await();
			if (!success) {
				return { success: false, error: "Unable to complete request." };
			}
			return result;
		});

		contextbridge.callback<ServerBridgeApiUnlistServer>(ServerListServiceBridgeTopics.UnlistServer, (_) => {
			const [success, result] = this.UnlistServer().await();
			if (!success) {
				return { success: false, error: "Unable to complete request." };
			}
			return result;
		});

		contextbridge.callback<ServerBridgeApiGetServerList>(ServerListServiceBridgeTopics.GetServerList, (_) => {
			const [success, result] = this.GetServerList().await();
			if (!success) {
				return { success: false, error: "Unable to complete request." };
			}
			return result;
		});
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

	public async UnlistServer(): Promise<ReturnType<ServerBridgeApiUnlistServer>> {
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
