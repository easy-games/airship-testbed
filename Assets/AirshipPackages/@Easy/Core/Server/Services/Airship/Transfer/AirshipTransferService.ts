import {
	ServerBridgeApiCreateServer,
	ServerBridgeApiTransferGroupToGame,
	ServerBridgeApiTransferGroupToServer,
	TransferServiceBridgeTopics,
} from "@Easy/Core/Server/ProtectedServices/Airship/Transfer/ProtectedTransferService";
import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import {
	AirshipGameTransferConfig,
	AirshipServerConfig,
	AirshipServerTransferConfig,
} from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipTransfers";
import { CreateServerResponse } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipTransfers";
import { ContextBridgeUtil } from "@Easy/Core/Shared/Airship/Util/ContextBridgeUtil";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

/**
 * The transfer service allows you to move players between servers and create new servers.
 */
@Service({})
export class AirshipTransferService {
	/**
	 * Fired when the server begins shutting down.
	 *
	 * You can yield for up to 30 minutes to perform shutdown logic.
	 * You can also yield to ensure an in-progress match is completed.
	 */
	public onShutdown = new Signal().WithAllowYield(true);

	/**
	 * If true, players are automatically transfered into a new server when the server shuts down.
	 *
	 * We try to transfer all players to the same server so they stay together.
	 */
	public transferPlayersOnShutdown = true;

	constructor() {
		Platform.Server.Transfer = this;
	}

	protected OnStart(): void {
		contextbridge.callback("ServerShutdown", (from) => {
			this.onShutdown.Fire();

			if (this.transferPlayersOnShutdown) {
				this.TransferGroupToGame(Airship.Players.GetPlayers(), Game.gameId);
			}
		});
	}

	/**
	 * Creates a new server and returns a server id which can be used to transfer players to the new server.
	 * @param config The configuration the server should start with. If not provided, the server will use the defaults
	 * provided during deployment.
	 * @returns The id of the new server. Undefined if the server was not able to be created.
	 */
	public async CreateServer(config?: AirshipServerConfig): Promise<CreateServerResponse> {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiCreateServer>(
			TransferServiceBridgeTopics.CreateServer,
			LuauContext.Protected,
			config,
		);
		if (!result.success) throw result.error;
		return result.data;
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
	): Promise<void> {
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
	): Promise<void> {
		let userIds: string[];
		if (typeIs(players, "table")) {
			userIds = (players as Player[]).map((p) => p.userId);
		} else {
			userIds = players;
		}
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiTransferGroupToGame>(
			TransferServiceBridgeTopics.TransferGroupToGame,
			LuauContext.Protected,
			userIds,
			gameId,
			config,
		);
		if (!result.success) throw result.error;
		return result.data;
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
	): Promise<void> {
		let userId: string;
		if (typeIs(player, "table")) {
			userId = player.username;
		} else {
			userId = player;
		}
		return await this.TransferGroupToServer([userId], serverId, config);
	}

	/**
	 * Transfers a group of players to the provided server. The server can be in any scene, but must be part of the current servers game.
	 * @param player The players to transfer, either userIds or Player objects
	 * @param serverId The server to transfer the players to
	 * @param config The configuration to be used for this transfer {@link AirshipGameTransferConfig}
	 */
	public async TransferGroupToServer(
		userIds: string[],
		serverId: string,
		config?: AirshipServerTransferConfig,
	): Promise<void> {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiTransferGroupToServer>(
			TransferServiceBridgeTopics.TransferGroupToServer,
			LuauContext.Protected,
			userIds,
			serverId,
			config,
		);
		if (!result.success) throw result.error;
		return result.data;
	}
}
