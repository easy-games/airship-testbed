import {
	ClientBridgeApiGetFriendServers,
	ClientBridgeApiGetRegionLatencies,
	ClientBridgeApiGetServerList,
	ServerManagerControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/ServerManager/ProtectedServerManagerController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { AirshipServer, AirshipServerWithFriends } from "@Easy/Core/Shared/Airship/Types/AirshipServerManager";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";

/**
 * Allows access to game server information.
 */
@Controller({})
export class AirshipServerManagerController {
	constructor() {
		if (!Game.IsClient()) return;

		Platform.Client.ServerManager = this;
	}

	protected OnStart(): void {}

	/**
	 * Gets the best regions for the local client. Only valid regions will be returned, meaning the ordered
	 * array and values may be empty if the player could not reach the ping servers.
	 *
	 * @returns The "orderedRegionIds" field is the regionIds ordered by lowest ping first. The "regionLatencies" field is a map of regionId to
	 * ping value.
	 */
	public async GetBestRegions(): Promise<{
		orderedRegionIds: string[];
		regionLatencies: { [regionId: string]: number };
	}> {
		const regionLatencies = contextbridge.invoke<ClientBridgeApiGetRegionLatencies>(
			ServerManagerControllerBridgeTopics.GetRegionLatencies,
			LuauContext.Protected,
		);
		const ordered = ObjectUtils.entries(regionLatencies)
			.sort((a, b) => a[1] < b[1])
			.map((entry) => entry[0] as string);
		return {
			orderedRegionIds: ordered,
			regionLatencies: regionLatencies,
		};
	}

	/**
	 * Gets a page of the server list.
	 * @param page The page to retrieve. Starts at 0.
	 */
	public async GetServerList(page: number = 0): Promise<{ entries: AirshipServer[] }> {
		return contextbridge.invoke<ClientBridgeApiGetServerList>(
			ServerManagerControllerBridgeTopics.GetServerList,
			LuauContext.Protected,
		);
	}

	/**
	 * Gets servers friends of this user are on. Only listed servers are returned.
	 */
	public async GetFriendServers(): Promise<{ entries: AirshipServerWithFriends[] }> {
		return contextbridge.invoke<ClientBridgeApiGetFriendServers>(
			ServerManagerControllerBridgeTopics.GetFriendServers,
			LuauContext.Protected,
		);
	}
}
