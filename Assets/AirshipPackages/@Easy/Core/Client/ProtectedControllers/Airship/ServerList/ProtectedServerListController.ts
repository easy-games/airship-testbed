import {
	AirshipServerData,
	ServerListEntryWithFriends,
} from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipServerManager";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { RetryHttp429 } from "@Easy/Core/Shared/Http/HttpRetry";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum ServerListControllerBridgeTopics {
	GetServerList = "ServerListController:GetServerList",
	GetFriendServers = "ServerListController:GetFriendServers",
}

export type ClientBridgeApiGetServerList = (page?: number) => { entries: AirshipServerData[] };
export type ClientBridgeApiGetFriendServers = () => { entries: ServerListEntryWithFriends[] };

@Controller({})
export class ProtectedServerListController {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<ClientBridgeApiGetServerList>(ServerListControllerBridgeTopics.GetServerList, (_) => {
			return this.GetServerList().expect();
		});

		contextbridge.callback<ClientBridgeApiGetFriendServers>(
			ServerListControllerBridgeTopics.GetFriendServers,
			(_) => {
				return this.GetFriendServers().expect();
			},
		);
	}

	public async GetServerList(page: number = 0): Promise<ReturnType<ClientBridgeApiGetServerList>> {
		const res = await RetryHttp429(() => InternalHttpManager.GetAsync(
			`${AirshipUrl.GameCoordinator}/servers/game-id/${Game.gameId}/list?page=${page}`,
		), { retryKey: "get/game-coordinator/servers/game-id/:gameId/list" });

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get server list. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return json.decode(res.data) as { entries: AirshipServerData[] };
	}

	public async GetFriendServers(): Promise<ReturnType<ClientBridgeApiGetFriendServers>> {
		const res = await RetryHttp429(() => InternalHttpManager.GetAsync(
			`${AirshipUrl.GameCoordinator}/servers/game-id/${Game.gameId}/list/friends`,
		), { retryKey: "get/game-coordinator/servers/game-id/:gameId/list/friends" });

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get friend server list. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return json.decode(res.data) as { entries: ServerListEntryWithFriends[] };
	}

	protected OnStart(): void {}
}
