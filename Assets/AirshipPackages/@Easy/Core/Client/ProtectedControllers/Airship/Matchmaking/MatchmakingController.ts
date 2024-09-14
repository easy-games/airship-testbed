import { Group } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipMatchmaking";
import { Party } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipParty";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { awaitToResult, processResponse } from "@Easy/Core/Shared/Util/AirshipUtil";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

export const enum MatchmakingControllerBridgeTopics {
	GetGroupForSelf = "MatchmakingController:GetGroupForSelf",
	LeaveQueueForSelf = "MatchmakingController:LeaveQueueForSelf",
}

export type ClientBridgeApiGetGroupForSelf = () => Result<Group | undefined, string>;
export type ClientBridgeApiLeaveQueueForSelf = () => Result<Group | undefined, string>;

@Controller({})
export class ProtectedPartyController {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<ClientBridgeApiGetGroupForSelf>(
			MatchmakingControllerBridgeTopics.GetGroupForSelf,
			(_) => awaitToResult(this.GetCurrentGroup())
		);
	}

	public async GetCurrentGroup(): Promise<ReturnType<ClientBridgeApiGetGroupForSelf>> {
		print(`protected: MatchmakingController.GetCurrentGroup`);
		const currentGameId = Game.gameId;
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/groups/game-id/:gameId/self`);

		return processResponse(res, `An error occurred while trying to find group for game ${currentGameId}`, { allowEmptyData: true });
	}

	public async LeaveQueueForSelf(): Promise<ReturnType<ClientBridgeApiLeaveQueueForSelf>> {
		print(`protected: MatchmakingController.LeaveQueueForSelf`);
		const currentGameId = Game.gameId;
		const res = InternalHttpManager.PostAsync(`${AirshipUrl.GameCoordinator}/matchmaking/queue/leave/self`);
		return processResponse(res, `An error occurred while trying to leave queue for game ${currentGameId}`, { allowEmptyData: true });
	}

	protected OnStart(): void { }
}
