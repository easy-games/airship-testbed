import {
	ClientBridgeApiGetGroupForSelf,
	ClientBridgeApiLeaveQueue,
	MatchmakingControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/Matchmaking/MatchmakingController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { Group } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipMatchmaking";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import inspect from "@Easy/Core/Shared/Util/Inspect";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

@Controller({})
export class AirshipMatchmakingController {
	public readonly onGroupChange: Signal<[newGroup: Group, oldGroup?: Group]> = new Signal();
	private oldGroup: Group | undefined;

	constructor() {
		if (!Game.IsClient()) return;

		Platform.Client.Matchmaking = this;

		contextbridge.callback(MatchmakingControllerBridgeTopics.OnGroupChange, (_, group) => {
			const previous = this.oldGroup;
			print("oldGroup: " + inspect(this.oldGroup));
			print("newGroup: " + inspect(group));
			this.onGroupChange.Fire(group, previous);
			this.oldGroup = group;
		});
	}

	protected OnStart(): void {}

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
