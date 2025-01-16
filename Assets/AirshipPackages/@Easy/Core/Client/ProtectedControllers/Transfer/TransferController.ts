import { AirshipGameServer } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipTransfers";
import { Controller, Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import inspect from "@Easy/Core/Shared/Util/Inspect";
import { MainMenuPartyController } from "../Social/MainMenuPartyController";
import { SocketController } from "../Socket/SocketController";
import { RetryHttp } from "@Easy/Core/Shared/Http/HttpRetry";

@Controller({})
export class TransferController {
	constructor(private readonly socketController: SocketController) {}

	protected OnStart(): void {
		this.socketController.On<{
			gameServer: AirshipGameServer;
			gameId: string;
			gameVersion: number;
			requestTime: number;
			transferData?: unknown;
			loadingScreenImageId?: string;
		}>("game-coordinator/server-transfer", (data) => {
			print("Received transfer event: " + inspect(data));
			if (Game.serverId === data.gameServer.serverId) {
				print("Recieved transfer event for server we are already connected to. Ignoring.");
				return;
			}
			TransferManager.Instance.ConnectToServer(data.gameServer.ip, data.gameServer.port);

			try {
				// supporting old versions of player by try catching this
				CrossSceneState.ServerTransferData.gameId = data.gameId;
				CrossSceneState.ServerTransferData.loadingImageUrl = data.loadingScreenImageId
					? `${AirshipUrl.CDN}/images/${data.loadingScreenImageId}`
					: "";
			} catch (err) {}
		});
	}

	/**
	 * Submits a request to transfer to the provided game id. The client can optionally request to transfer
	 * to a specific server of the given game by providing the perferred server id. It is possible that the
	 * client will be transferred to a different server if the perferred server is full or was not allocated
	 * with the default scene.
	 * @param gameId Game id to join.
	 * @param preferredServerId Specific ServerID to teleport to. If not included, the backend will select a server for you.
	 */
	public async TransferToGameAsync(
		gameId: string,
		preferredServerId?: string,
	): Promise<Result<undefined, undefined>> {
		let isPartyLeader = Dependency<MainMenuPartyController>().IsPartyLeader();

		const res = await RetryHttp(() => InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/transfers/transfer/self",
			json.encode({
				gameId: gameId,
				preferredServerId,
				withParty: isPartyLeader,
			}),
		), { retryKey: "post/game-coordinator/transfers/transfer/self" });

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete transfer request. Status Code:  ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Submits a request to transfer to the current party leader. If the party leader is not in a game,
	 * or the client is not in a party, this function will have no effect.
	 */
	public async TransferToPartyLeader(): Promise<Result<undefined, undefined>> {
		const res = await RetryHttp(() => InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/transfers/transfer/self/party",
			"",
		), { retryKey: "post/game-coordinator/transfers/transfer/self/party" });

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete transfer request. Status Code:  ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Submits a request to transfer party members to the party leader.
	 * Only the party leader can send this request.
	 */
	public async TransferPartyMembersToLeader(): Promise<boolean> {
		const res = await RetryHttp(() => InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/transfers/transfer/party",
			"",
		), { retryKey: "post/game-coordinator/transfers/transfer/party" });

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete transfer request. Status Code:  ${res.statusCode}.\n`, res.error);
			return false;
		}

		return true;
	}
}
