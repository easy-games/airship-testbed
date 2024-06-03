import {
	ServerBridgeApiCreateServer,
	ServerBridgeApiTransferGroupToGame,
	ServerBridgeApiTransferGroupToServer,
	TransferServiceBridgeTopics,
} from "@Easy/Core/Server/ProtectedServices/Airship/Transfer/TransferService";
import { Platform } from "@Easy/Core/Shared/Airship";
import { AirshipServerConfig } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipTransfers";
import { AirshipUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Result } from "@Easy/Core/Shared/Types/Result";

export type CreateServerResponse = {
	serverId: string;
};

@Service({})
export class TransferService implements OnStart {
	constructor() {
		if (!Game.IsServer()) return;

		Platform.server.transfer = this;
	}

	OnStart(): void {}

	/**
	 * Creates a new server and returns a server id which can be used to transfer players to the new server.
	 * @param config The configuration the server should start with. If not provided, the server will use the defaults
	 * provided during deployment.
	 * @returns The id of the new server. Undefined if the server was not able to be created.
	 */
	public async CreateServer(config?: AirshipServerConfig): Promise<Result<CreateServerResponse, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiCreateServer>(
			TransferServiceBridgeTopics.CreateServer,
			config,
		);
	}

	/**
	 * Transfers a player to the provided game. A server in the default scene will be selected, or a new one will be created.
	 * @param player The player to transfer
	 * @param gameId The gameId to transfer the player to
	 * @param sceneId The sceneId to transfer the player to. Note that this is based on the scene the server was _started_ with,
	 * not it's currently active scene. If no servers are available, a new server with this starting scene will be created.
	 * @param serverTransferData JSON encodable object that will be provided to the server being joined
	 * @param clientTransferData JSON encodable object that will be provided to the client on transfer
	 */
	public async TransferToGame(
		player: Player,
		gameId: string,
		sceneId?: string,
		serverTransferData?: unknown,
		clientTransferData?: unknown,
	): Promise<Result<undefined, undefined>> {
		return await this.TransferGroupToGame([player], gameId, sceneId, serverTransferData, clientTransferData);
	}

	/**
	 * Transfers a group of players to the provided game. A server in the default scene will be selected, or a new one will be created.
	 * @param player The players to transfer
	 * @param gameId The gameId to transfer the players to
	 * @param sceneId The sceneId to transfer the player to. Note that this is based on the scene the server was _started_ with,
	 * not it's currently active scene. If no servers are available, a new server with this starting scene will be created.
	 * @param serverTransferData JSON encodable object that will be provided to the server being joined
	 * @param clientTransferData JSON encodable object that will be provided to the clients on transfer
	 */
	public async TransferGroupToGame(
		players: readonly Player[],
		gameId: string,
		sceneId?: string,
		serverTransferData?: unknown,
		clientTransferData?: unknown,
	): Promise<Result<undefined, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiTransferGroupToGame>(
			TransferServiceBridgeTopics.TransferGroupToGame,
			players,
			gameId,
			sceneId,
			serverTransferData,
			clientTransferData,
		);
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
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiTransferGroupToServer>(
			TransferServiceBridgeTopics.TransferGroupToServer,
			players,
			serverId,
			serverTransferData,
			clientTransferData,
		);
	}
}
