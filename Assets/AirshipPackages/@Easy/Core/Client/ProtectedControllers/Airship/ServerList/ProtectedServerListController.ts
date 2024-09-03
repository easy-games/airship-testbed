import {
	AirshipServerData,
	ServerListEntryWithFriends,
} from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipServerManager";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { DecodeJSON } from "@Easy/Core/Shared/json";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum ServerListControllerBridgeTopics {
	GetServerList = "ServerListController:GetServerList",
	GetFriendServers = "ServerListController:GetFriendServers",
}

export type ClientBridgeApiGetServerList = (page?: number) => Result<{ entries: AirshipServerData[] }, string>;
export type ClientBridgeApiGetFriendServers = () => Result<{ entries: ServerListEntryWithFriends[] }, string>;

@Service({})
export class ProtectedTransferService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ClientBridgeApiGetServerList>(ServerListControllerBridgeTopics.GetServerList, (_) => {
			const [success, result] = this.GetServerList().await();
			if (!success) {
				return { success: false, error: "Unable to complete request." };
			}
			return result;
		});

		contextbridge.callback<ClientBridgeApiGetFriendServers>(
			ServerListControllerBridgeTopics.GetFriendServers,
			(_) => {
				const [success, result] = this.GetFriendServers().await();
				if (!success) {
					return { success: false, error: "Unable to complete request." };
				}
				return result;
			},
		);
	}

	public async GetServerList(page: number = 0): Promise<ReturnType<ClientBridgeApiGetServerList>> {
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

	public async GetFriendServers(): Promise<ReturnType<ClientBridgeApiGetFriendServers>> {
		const res = InternalHttpManager.GetAsync(
			`${AirshipUrl.GameCoordinator}/servers/game-id/${Game.gameId}/list/friends`,
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get friend server list. Status Code:  ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: res.error,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data) as { entries: ServerListEntryWithFriends[] },
		};
	}

	protected OnStart(): void {}
}
