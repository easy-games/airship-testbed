import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { SocketController } from "../../Socket/SocketController";
import { GameCoordinatorClient, GameCoordinatorGroups } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";

export const enum MatchmakingControllerBridgeTopics {
	GetGroupForSelf = "MatchmakingController:GetGroupForSelf",
	LeaveQueue = "MatchmakingController:LeaveQueue",
	OnGroupChange = "MatchmakingController:OnGroupChange",
}

export type ClientBridgeApiGetGroupForSelf = () => GameCoordinatorGroups.Group | undefined;
export type ClientBridgeApiLeaveQueue = () => undefined;

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

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

		this.socketController.On<GameCoordinatorGroups.Group>("game-coordinator/group-change", (data) => {
			contextbridge.invoke(MatchmakingControllerBridgeTopics.OnGroupChange, LuauContext.Game, data);
		});
	}

	public async GetCurrentGroup(): Promise<ReturnType<ClientBridgeApiGetGroupForSelf>> {
		const result = await client.groups.getGameGroupForSelf({ gameId: Game.gameId });
		return result.group;
	}

	public async LeaveQueue(): Promise<ReturnType<ClientBridgeApiLeaveQueue>> {
		await client.matchmaking.leaveQueueSelf({ gameId: Game.gameId });
	}

	protected OnStart(): void {}
}
