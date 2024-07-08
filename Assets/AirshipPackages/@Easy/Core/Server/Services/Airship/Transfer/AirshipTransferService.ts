import {
	ServerBridgeApiCreateServer,
	ServerBridgeApiTransferGroupToGame,
	ServerBridgeApiTransferGroupToServer,
	TransferServiceBridgeTopics,
} from "@Easy/Core/Server/ProtectedServices/Airship/Transfer/ProtectedTransferService";
import { Platform } from "@Easy/Core/Shared/Airship";
import {
	AirshipGameTransferConfig,
	AirshipServerConfig,
	AirshipServerTransferConfig,
} from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipTransfers";
import { CreateServerResponse } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipTransfers";
import { AirshipUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

/**
 * The transfer service allows you to move players between servers and create new servers.
 */
@Service({})
export class AirshipTransferService {
	public onShutdown = new Signal();

	constructor() {
		Platform.Server.Transfer = this;
	}

	protected OnStart(): void {
		contextbridge.callback("ServerShutdown", (from) => {
			this.onShutdown.Fire();
		});
	}

	/**
	 * Creates a new server and returns a server id which can be used to transfer players to the new server.
	 * @param config The configuration the server should start with. If not provided, the server will use the defaults
	 * provided during deployment.
	 * @returns The id of the new server. Undefined if the server was not able to be created.
	 */
	public async CreateServer(config?: AirshipServerConfig): Promise<Result<CreateServerResponse, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiCreateServer>(
			TransferServiceBridgeTopics.CreateServer,
			LuauContext.Protected,
			config,
		);
	}

	/**
	 * Transfers a player to the provided game. A server in the default scene will be selected, or a new one will be created.
	 * @param player The player to transfer, either userId or Player object
	 * @param gameId The gameId to transfer the player to
	 * @param config The configuration to be used for this transfer {@link AirshipGameTransferConfig}
	 */
	public async TransferToGame(
		player: Player | string,
		gameId: string,
		config?: AirshipGameTransferConfig,
	): Promise<Result<undefined, undefined>> {
		return await this.TransferGroupToGame([player], gameId, config);
	}

	/**
	 * Transfers a group of players to the provided game. A server in the default scene will be selected, or a new one will be created.
	 * @param players The players to transfer, either userIds or Player objects
	 * @param gameId The gameId to transfer the players to
	 * @param config The configuration to be used for this transfer {@link AirshipGameTransferConfig}
	 */
	public async TransferGroupToGame(
		players: readonly (Player | string)[],
		gameId: string,
		config?: AirshipGameTransferConfig,
	): Promise<Result<undefined, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiTransferGroupToGame>(
			TransferServiceBridgeTopics.TransferGroupToGame,
			LuauContext.Protected,
			players,
			gameId,
			config,
		);
	}

	/**
	 * Transfers a player to the provided server. The server can be in any scene, but must be part of the current servers game.
	 * @param player The player to transfer, either userId or Player object
	 * @param serverId The server to transfer the player to
	 * @param config The configuration to be used for this transfer {@link AirshipGameTransferConfig}
	 */
	public async TransferToServer(
		player: Player | string,
		serverId: string,
		config?: AirshipServerTransferConfig,
	): Promise<Result<undefined, undefined>> {
		return await this.TransferGroupToServer([player], serverId, config);
	}

	/**
	 * Transfers a group of players to the provided server. The server can be in any scene, but must be part of the current servers game.
	 * @param player The players to transfer, either userIds or Player objects
	 * @param serverId The server to transfer the players to
	 * @param config The configuration to be used for this transfer {@link AirshipGameTransferConfig}
	 */
	public async TransferGroupToServer(
		players: readonly (Player | string)[],
		serverId: string,
		config?: AirshipServerTransferConfig,
	): Promise<Result<undefined, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiTransferGroupToServer>(
			TransferServiceBridgeTopics.TransferGroupToServer,
			LuauContext.Protected,
			players,
			serverId,
			config,
		);
	}
}
