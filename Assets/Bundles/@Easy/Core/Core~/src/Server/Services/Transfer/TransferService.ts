import { OnStart, Service } from "@easy-games/flamework-core";
import { Player } from "Shared/Player/Player";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "Shared/json";
import { CreateServerResponse } from "./TransferServiceTypes";

@Service({})
export class TransferService implements OnStart {
	OnStart(): void {}

	public CreateServer(sceneId?: string): CreateServerResponse | undefined {
		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/servers/create",
			EncodeJSON({
				sceneId: sceneId,
			}),
		);
		if (res.success) {
			const data = DecodeJSON<{
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
			EncodeJSON({
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
			EncodeJSON({
				uid: player.userId,
				serverId,
				serverTransferData,
				clientTransferData,
			}),
		);
	}
}
