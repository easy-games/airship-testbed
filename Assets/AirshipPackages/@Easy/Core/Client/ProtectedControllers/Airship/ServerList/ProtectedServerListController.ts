import { AirshipServer, AirshipServerWithFriends } from "@Easy/Core/Shared/Airship/Types/AirshipServerManager";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { HttpRetryInstance } from "@Easy/Core/Shared/Http/HttpRetry";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum ServerListControllerBridgeTopics {
	GetServerList = "ServerListController:GetServerList",
	GetFriendServers = "ServerListController:GetFriendServers",
}

export type ClientBridgeApiGetServerList = (page?: number) => { entries: AirshipServer[] };
export type ClientBridgeApiGetFriendServers = () => { entries: AirshipServerWithFriends[] };

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

@Controller({})
export class ProtectedServerListController {
	private readonly httpRetry = HttpRetryInstance();

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
		const result = await client.servers.getServerList({
			params: { gameId: Game.gameId },
			query: { page },
		});

		return result;
	}

	public async GetFriendServers(): Promise<ReturnType<ClientBridgeApiGetFriendServers>> {
		const result = await client.servers.getServerListOfFriends({ gameId: Game.gameId });

		return result;
	}

	protected OnStart(): void {}
}
