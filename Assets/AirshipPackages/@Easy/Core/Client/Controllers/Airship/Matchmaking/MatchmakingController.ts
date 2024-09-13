import { ClientBridgeApiGetGroupForSelf, ClientBridgeApiLeaveQueueForSelf, MatchmakingControllerBridgeTopics } from "@Easy/Core/Client/ProtectedControllers/Airship/Matchmaking/MatchmakingController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { Group } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipMatchmaking";
import { ContextBridgeUtil } from "@Easy/Core/Shared/Airship/Util/ContextBridgeUtil";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

/**
 * This controller provides information about the users matchmaking status.
 */
@Controller({})
export class MatchmakingController {
	constructor() {
		if (!Game.IsClient()) return;

		Platform.Client.Matchmaking = this;
	}

	protected OnStart(): void { }

	/**
	 * Gets the users current party data.
	 */
	public async GetCurrentGroup(): Promise<Group | undefined> {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ClientBridgeApiGetGroupForSelf>(
			MatchmakingControllerBridgeTopics.GetGroupForSelf,
			LuauContext.Protected,
		);
		if (!result.success) throw result.error;
		return result.data;
	}

	/**
	 * Leaves the current queue if the user in a group and that group is in a queue. This stops matchmaking for the entire group.
	 */
	public async LeaveQueueForSelf(): Promise<Group | undefined> {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ClientBridgeApiLeaveQueueForSelf>(
			MatchmakingControllerBridgeTopics.LeaveQueueForSelf,
			LuauContext.Protected,
		);
		if (!result.success) throw result.error;
		return result.data;
	}
}
