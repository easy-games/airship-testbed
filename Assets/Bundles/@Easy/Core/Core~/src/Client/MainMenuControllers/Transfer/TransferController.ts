import { Controller, OnStart } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { GameServer } from "Shared/SocketIOMessages/Party";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { encode } from "Shared/json";
import { SocketController } from "../Socket/SocketController";

@Controller({})
export class TransferController implements OnStart {
	constructor(private readonly socketController: SocketController) {}

	OnStart(): void {
		this.socketController.On<{
			gameServer: GameServer;
			gameId: string;
			gameVersion: number;
			requestTime: number;
			transferData?: unknown;
		}>("game-coordinator/server-transfer", (data) => {
			print("Received transfer event: " + inspect(data));
			TransferManager.Instance.ConnectToServer(data.gameServer.ip, data.gameServer.port);
		});
	}

	/**
	 * Sends a server transfer request to the backend.
	 * @param gameId GameID of the desired server
	 * @param serverId Specific ServerID to teleport to. If not included, the backend will select a server for you.
	 */
	public ClientTransferToServerAsync(gameId: string, serverId?: string): void {
		InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/transfers/transfer/self",
			encode({
				gameId: gameId,
				preferredServerId: serverId,
			}),
		);
	}
}
