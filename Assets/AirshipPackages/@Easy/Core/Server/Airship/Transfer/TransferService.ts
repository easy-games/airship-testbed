import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { Platform } from "@Easy/Core/Shared/Airship";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";

export type CreateServerResponse = {
	serverId: string;
};

@Service({})
export class TransferService implements OnStart {
	constructor() {
		if (RunUtil.IsServer()) Platform.server.transfer = this;
	}

	OnStart(): void {}

	/**
	 * Creates a new server and returns a server id which can be used to transfer players to the new server.
	 * @param sceneId The sceneId the server should start with. If not provided, the server will use the default
	 * scene provided during deployment.
	 * @returns The id of the new server. Undefined if the server was not able to be created.
	 */
	public async CreateServer(sceneId?: string): Promise<Result<CreateServerResponse, undefined>> {
		const res = await TransferServiceBackend.CreateServer(
			EncodeJSON({
				sceneId: sceneId,
			}),
		);

		if (!res.success && res.statusCode > 299) {
			warn(`Unable to create server. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON<{
				serverId: string;
			}>(res.data),
		};
	}

	/**
	 * Transfers a player to the provided game. A server in the default scene will be selected, or a new one will be created.
	 * @param player The player to transfer
	 * @param gameId The gameId to transfer the player to
	 * @param serverTransferData JSON encodable object that will be provided to the server being joined
	 * @param clientTransferData JSON encodable object that will be provided to the client on transfer
	 */
	public async TransferToGame(
		player: Player,
		gameId: string,
		serverTransferData?: unknown,
		clientTransferData?: unknown,
	): Promise<Result<undefined, undefined>> {
		return await this.TransferGroupToGame([player], gameId, serverTransferData, clientTransferData);
	}

	/**
	 * Transfers a group of players to the provided game. A server in the default scene will be selected, or a new one will be created.
	 * @param player The players to transfer
	 * @param gameId The gameId to transfer the players to
	 * @param serverTransferData JSON encodable object that will be provided to the server being joined
	 * @param clientTransferData JSON encodable object that will be provided to the clients on transfer
	 */
	public async TransferGroupToGame(
		players: readonly Player[],
		gameId: string,
		serverTransferData?: unknown,
		clientTransferData?: unknown,
	): Promise<Result<undefined, undefined>> {
		const res = await TransferServiceBackend.Transfer(
			EncodeJSON({
				uid: players.map((p) => p.userId),
				gameId,
				serverTransferData,
				clientTransferData,
			}),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete transfer request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Transfers a player to the provided server. The server can be in any scene, but must be part of the current servers game.
	 * @param player The player to transfer
	 * @param serverId The server to transfer the player to
	 * @param serverTransferData JSON encodable object that will be provided to the server being joined
	 * @param clientTransferData JSON encodable object that will be provided to the client on transfer
	 */
	public async TransferToServer(
		player: Player,
		serverId: string,
		serverTransferData?: unknown,
		clientTransferData?: unknown,
	): Promise<Result<undefined, undefined>> {
		return await this.TransferGroupToServer([player], serverId, serverTransferData, clientTransferData);
	}

	/**
	 * Transfers a group of players to the provided server. The server can be in any scene, but must be part of the current servers game.
	 * @param player The players to transfer
	 * @param serverId The server to transfer the players to
	 * @param serverTransferData JSON encodable object that will be provided to the server being joined
	 * @param clientTransferData JSON encodable object that will be provided to the clients on transfer
	 */
	public async TransferGroupToServer(
		players: readonly Player[],
		serverId: string,
		serverTransferData?: unknown,
		clientTransferData?: unknown,
	): Promise<Result<undefined, undefined>> {
		const res = await TransferServiceBackend.Transfer(
			EncodeJSON({
				uids: players.map((p) => p.userId),
				serverId,
				serverTransferData,
				clientTransferData,
			}),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete transfer request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}
}
