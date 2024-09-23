import { Group } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipMatchmaking";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";

export const enum MatchmakingControllerBridgeTopics {
	GetGroupForSelf = "MatchmakingController:GetGroupForSelf",
	LeaveQueue = "MatchmakingController:LeaveQueue",
}

export type ClientBridgeApiGetGroupForSelf = () => Group | undefined;
export type ClientBridgeApiLeaveQueue = () => Group | undefined;

@Controller({})
export class ProtectedMatchmakingController {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<ClientBridgeApiGetGroupForSelf>(
			MatchmakingControllerBridgeTopics.GetGroupForSelf,
			(_) => this.GetCurrentGroup().expect()
		);

		contextbridge.callback<ClientBridgeApiLeaveQueue>(
			MatchmakingControllerBridgeTopics.LeaveQueue,
			(_) => this.LeaveQueue().expect()
		);
	}

	public async GetCurrentGroup(): Promise<ReturnType<ClientBridgeApiGetGroupForSelf>> {
		print(`protected: MatchmakingController.GetCurrentGroup`);
		const currentGameId = Game.gameId;
		const result = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/groups/game-id/:gameId/self`);

		if (!result.success || result.statusCode > 299) {
			warn(`An error occurred while trying to find group for game ${currentGameId}. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		if (!result.data) {
			return undefined;
		}

		return DecodeJSON(result.data) as Group;
	}

	public async LeaveQueue(): Promise<ReturnType<ClientBridgeApiLeaveQueue>> {
		print(`protected: MatchmakingController.LeaveQueue`);
		const currentGameId = Game.gameId;
		const result = InternalHttpManager.PostAsync(`${AirshipUrl.GameCoordinator}/matchmaking/queue/leave/self`);

		if (!result.success || result.statusCode > 299) {
			warn(`An error occurred while trying to leave queue for game ${currentGameId}. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		if (!result.data) {
			return undefined;
		}

		return DecodeJSON(result.data) as Group;
	}

	protected OnStart(): void { }
}
