import {
	AirshipGameServerConnectionInfo,
	AirshipTransferResult,
} from "@Easy/Core/Shared/Airship/Types/AirshipServerManager";
import { Controller, Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import inspect from "@Easy/Core/Shared/Util/Inspect";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { MainMenuPartyController } from "../Social/MainMenuPartyController";
import { SocketController } from "../Socket/SocketController";

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

export const enum TransferControllerBridgeTopics {
	TransferRequested = "TransferController:TransferRequested",
	TransferToPartyLeader = "TransferController:TransferToPartyLeader",
	TransferToGame = "TransferController:TransferToGame",
}

export type ClientBridgeApiTransferRequested = (transfer: { gameId: string; serverId: string }) => void;
export type ClientBridgeApiTransferToGame = (gameId: string, preferredServerId?: string) => AirshipTransferResult;
export type ClientBridgeApiTransferToPartyLeader = () => AirshipTransferResult;

interface SocketTransferData {
	gameServer: AirshipGameServerConnectionInfo;
	gameId: string;
	gameVersion: number;
	requestTime: number;
	transferData?: unknown;
	loadingScreenImageId?: string;
}
@Controller({})
export class TransferController {
	/** Fired when a transfer has been requested, just before the transfer will occur. */
	onTransferRequested: Signal<SocketTransferData> = new Signal<SocketTransferData>().WithAllowYield(true);

	constructor(private readonly socketController: SocketController) {
		contextbridge.callback<ClientBridgeApiTransferToGame>(
			TransferControllerBridgeTopics.TransferToGame,
			(from, gameId: string, preferredServerId?: string) => {
				return this.TransferToGameAsync(gameId, preferredServerId).expect();
			},
		);

		contextbridge.callback<ClientBridgeApiTransferToPartyLeader>(
			TransferControllerBridgeTopics.TransferToPartyLeader,
			(from) => {
				return this.TransferToPartyLeader().expect();
			},
		);
	}

	protected OnStart(): void {
		this.socketController.On<SocketTransferData>("game-coordinator/server-transfer", (data) => {
			print("Received transfer event: " + inspect(data));
			if (Game.serverId === data.gameServer.serverId) {
				print("Recieved transfer event for server we are already connected to. Ignoring.");
				return;
			}

			const Transfer = () => {
				this.onTransferRequested.Fire(data);
				TransferManager.Instance.ConnectToServer(data.gameServer.ip, data.gameServer.port);

				try {
					// supporting old versions of player by try catching this
					CrossSceneState.ServerTransferData.gameId = data.gameId;
					CrossSceneState.ServerTransferData.loadingImageUrl = data.loadingScreenImageId
						? `${AirshipUrl.CDN}/images/${data.loadingScreenImageId}`
						: "";
				} catch (err) {}
			};

			let startedTransfer = false;
			let intraGameTransfer = data.gameId === Game.gameId;

			if (intraGameTransfer) {
				task.spawn(() => {
					contextbridge.invoke<ClientBridgeApiTransferRequested>(
						TransferControllerBridgeTopics.TransferRequested,
						LuauContext.Game,
						{ gameId: data.gameId, serverId: data.gameServer.serverId },
					);
					if (startedTransfer) return;
					startedTransfer = false;
					Transfer();
				});
			}

			// Give the game 10 seconds before forcing the transfer.
			task.unscaledDelay(intraGameTransfer ? 10 : 0, () => {
				if (startedTransfer) return;
				startedTransfer = false;
				Transfer();
			});
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
	public async TransferToGameAsync(gameId: string, preferredServerId?: string): Promise<AirshipTransferResult> {
		let isPartyLeader = Dependency<MainMenuPartyController>().IsPartyLeader();

		return await client.transfers.requestSelfTransfer({
			gameId: gameId,
			preferredServerId,
			withParty: isPartyLeader,
		});
	}

	/**
	 * Submits a request to transfer to the current party leader. If the party leader is not in a game,
	 * or the client is not in a party, this function will have no effect.
	 */
	public async TransferToPartyLeader(): Promise<AirshipTransferResult> {
		return await client.transfers.requestSelfToPartyTransfer();
	}

	/**
	 * Submits a request to transfer party members to the party leader.
	 * Only the party leader can send this request.
	 */
	public async TransferPartyMembersToLeader(): Promise<AirshipTransferResult> {
		return await client.transfers.requestTransferPartyToSelf();
	}
}
