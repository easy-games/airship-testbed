import { AirshipServer, AirshipServerWithFriends } from "@Easy/Core/Shared/Airship/Types/AirshipServerManager";
import { Controller, Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { SocketController } from "../../Socket/SocketController";

export const enum ServerManagerControllerBridgeTopics {
	GetServerList = "ServerListController:GetServerList",
	GetFriendServers = "ServerListController:GetFriendServers",
	GetRegionLatencies = "UserController:GetRegionLatencies",
}

export type ClientBridgeApiGetServerList = (page?: number) => { entries: AirshipServer[] };
export type ClientBridgeApiGetFriendServers = () => { entries: AirshipServerWithFriends[] };
export type ClientBridgeApiGetRegionLatencies = () => { [regionId: string]: number };

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

@Controller({})
export class ProtectedServerManagerController {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<ClientBridgeApiGetServerList>(ServerManagerControllerBridgeTopics.GetServerList, (_) => {
			return this.GetServerList().expect();
		});

		contextbridge.callback<ClientBridgeApiGetFriendServers>(
			ServerManagerControllerBridgeTopics.GetFriendServers,
			(_) => {
				return this.GetFriendServers().expect();
			},
		);

		contextbridge.callback<ClientBridgeApiGetRegionLatencies>(
			ServerManagerControllerBridgeTopics.GetRegionLatencies,
			(_) => {
				const result = Dependency<SocketController>().GetRegionLatencies().await();
				return result[0] ? result[1] ?? {} : {};
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
