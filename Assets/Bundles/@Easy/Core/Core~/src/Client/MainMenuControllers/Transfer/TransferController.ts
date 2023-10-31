import { Controller, OnStart } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { GameServer } from "Shared/SocketIOMessages/Party";
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

	public ClientTransferToServer(gameId: string, serverId?: string): void {
		this.socketController.Emit("request-transfer", {
			gameId: gameId,
			preferredServerId: serverId,
		});
	}
}
