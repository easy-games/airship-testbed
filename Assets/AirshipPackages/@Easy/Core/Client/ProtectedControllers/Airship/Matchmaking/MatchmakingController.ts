import { Group } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipMatchmaking";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";
import { SocketController } from "../../Socket/SocketController";

export const enum MatchmakingControllerBridgeTopics {
	GetGroupForSelf = "MatchmakingController:GetGroupForSelf",
	LeaveQueue = "MatchmakingController:LeaveQueue",
	OnGroupChange = "MatchmakingController:OnGroupChange",
}

export type ClientBridgeApiGetGroupForSelf = () => Group | undefined;
export type ClientBridgeApiLeaveQueue = () => undefined;

@Controller({})
export class ProtectedMatchmakingController {
	constructor(private readonly socketController: SocketController) {
		if (!Game.IsClient()) return;

		contextbridge.callback<ClientBridgeApiGetGroupForSelf>(MatchmakingControllerBridgeTopics.GetGroupForSelf, (_) =>
			this.GetCurrentGroup().expect(),
		);

		contextbridge.callback<ClientBridgeApiLeaveQueue>(MatchmakingControllerBridgeTopics.LeaveQueue, (_) =>
			this.LeaveQueue().expect(),
		);

		this.socketController.On<Group>("game-coordinator/group-change", (data) => {
			contextbridge.invoke(MatchmakingControllerBridgeTopics.OnGroupChange, LuauContext.Game, data);
		});
	}

	public async GetCurrentGroup(): Promise<ReturnType<ClientBridgeApiGetGroupForSelf>> {
		const currentGameId = Game.gameId;
		const result = InternalHttpManager.GetAsync(
			`${AirshipUrl.GameCoordinator}/groups/game-id/${currentGameId}/self`,
		);

		if (!result.success || result.statusCode > 299) {
			warn(
				`An error occurred while trying to find group for game ${currentGameId}. Status Code: ${result.statusCode}.\n`,
				result.error,
			);
			throw result.error;
		}

		return DecodeJSON<{ group: Group | undefined }>(result.data).group;
	}

	public async LeaveQueue(): Promise<ReturnType<ClientBridgeApiLeaveQueue>> {
		const currentGameId = Game.gameId;
		const result = InternalHttpManager.PostAsync(
			`${AirshipUrl.GameCoordinator}/matchmaking/queue/leave/self`,
			EncodeJSON({
				gameId: currentGameId,
			}),
		);

		if (!result.success || result.statusCode > 299) {
			warn(
				`An error occurred while trying to leave queue for game ${currentGameId}. Status Code: ${result.statusCode}.\n`,
				result.error,
			);
			throw result.error;
		}
	}

	protected OnStart(): void {}
}
