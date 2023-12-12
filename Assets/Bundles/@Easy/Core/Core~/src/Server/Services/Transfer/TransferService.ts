import { OnStart, Service } from "@easy-games/flamework-core";
import { Player } from "Shared/Player/Player";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { decode, encode } from "Shared/json";
import { CreateServerResponse } from "./TransferServiceTypes";

@Service({})
export class TransferService implements OnStart {
	OnStart(): void {}

	public CreateServer(sceneId?: string): CreateServerResponse | undefined {
		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/servers/create",
			encode({
				sceneId: sceneId,
			}),
		);
		if (res.success) {
			const data = decode<{
				serverId: string;
			}>(res.data);
			return data;
		}
		return undefined;
	}

	public TransferToGame(player: Player, gameId: string, serverTransferData?: unknown, clientTransferData?: unknown) {
		const jwt = GameObject.Find("ServerBootstrap")?.GetComponent<ServerBootstrap>().airshipJWT;
		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/transfers/transfer",
			encode({
				uid: player.userId,
				gameId,
				serverTransferData,
				clientTransferData,
			}),
		);
	}

	public TransferToServer(
		player: Player,
		serverId: string,
		serverTransferData?: unknown,
		clientTransferData?: unknown,
	) {
		const jwt = GameObject.Find("ServerBootstrap")?.GetComponent<ServerBootstrap>().airshipJWT;
		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/transfers/transfer",
			encode({
				uid: player.userId,
				serverId,
				serverTransferData,
				clientTransferData,
			}),
		);
	}
}
