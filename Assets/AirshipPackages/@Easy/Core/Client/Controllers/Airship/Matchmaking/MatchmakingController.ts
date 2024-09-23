import { ClientBridgeApiGetGroupForSelf, ClientBridgeApiLeaveQueue, MatchmakingControllerBridgeTopics } from "@Easy/Core/Client/ProtectedControllers/Airship/Matchmaking/MatchmakingController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { Group } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipMatchmaking";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

/**
 * This controller provides information about the users matchmaking status.
 */
@Controller({})
export class AirshipMatchmakingController {
	constructor() {
		if (!Game.IsClient()) return;

		Platform.Client.Matchmaking = this;
	}

	protected OnStart(): void { }

	/**
	 * Gets the users current matchmaking group data if they are in a group, otherwise returns undefined.
	 */
	public async GetCurrentGroup(): Promise<Group | undefined> {
		return contextbridge.invoke<ClientBridgeApiGetGroupForSelf>(
			MatchmakingControllerBridgeTopics.GetGroupForSelf,
			LuauContext.Protected,
		);
	}

	/**
	 * If the players group is in queue, removes the group from the queue. All players in the group will leave matchmaking.
	 */
	public async LeaveQueue(): Promise<Group | undefined> {
		return contextbridge.invoke<ClientBridgeApiLeaveQueue>(
			MatchmakingControllerBridgeTopics.LeaveQueue,
			LuauContext.Protected,
		);
	}
}
