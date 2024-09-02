import {
	ServerBridgeApiTransferGroupToGame,
	ServerBridgeApiTransferGroupToMatchingServer,
	ServerBridgeApiTransferGroupToPlayer,
	ServerBridgeApiTransferGroupToServer,
	TransferServiceBridgeTopics,
} from "@Easy/Core/Server/ProtectedServices/Airship/Transfer/ProtectedTransferService";
import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import {
	AirshipGameTransferConfig,
	AirshipMatchingServerTransferConfig,
	AirshipPlayerTransferConfig,
	AirshipServerTransferConfig,
} from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipTransfers";
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
		let userIds: string[] = players.map((player) => (typeIs(player, "table") ? player.userId : player));
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
	 * @param player The player to transfer, either userIds or Player objects
	 * @param serverId The server to transfer the player to
	 * @param config The configuration to be used for this transfer {@link AirshipGameTransferConfig}
	 */
	public async TransferToServer(
		player: Player | string,
		serverId: string,
		config?: AirshipServerTransferConfig,
	): Promise<void> {
		return await this.TransferGroupToServer([player], serverId, config);
	}

	/**
	 * Transfers a group of players to the provided server. The target server must be part of the same game.
	 * @param player The players to transfer, either userIds or Player objects
	 * @param serverId The server to transfer the players to
	 * @param config The configuration to be used for this transfer {@link AirshipGameTransferConfig}
	 */
	public async TransferGroupToServer(
		players: readonly (Player | string)[],
		serverId: string,
		config?: AirshipServerTransferConfig,
	): Promise<void> {
		let userIds: string[] = players.map((player) => (typeIs(player, "table") ? player.userId : player));
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

	/**
	 * Transfers a player to a server that matches the provided configuration. If any of the configuration
	 * parameters are missing, they will be ignored when selecting a server.
	 * @param players The player to transfer, either userId or Player object
	 * @param selectors The configuration for selecting a server. {@link AirshipMatchingServerTransferConfig}
	 */
	public async TransferToMatchingServer(player: Player | string, selectors: AirshipMatchingServerTransferConfig) {
		return await this.TransferGroupToMatchingServer([player], selectors);
	}

	/**
	 * Transfers a group of players to a server that matches the provided configuration. If any of the configuration
	 * parameters are missing, they will be ignored when selecting a server.
	 * @param players The players to transfer, either userIds or Player objects
	 * @param selectors The configuration for selecting a server. {@link AirshipMatchingServerTransferConfig}
	 */
	public async TransferGroupToMatchingServer(
		players: readonly (Player | string)[],
		selectors: AirshipMatchingServerTransferConfig,
	) {
		let userIds: string[] = players.map((player) => (typeIs(player, "table") ? player.userId : player));
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiTransferGroupToMatchingServer>(
			TransferServiceBridgeTopics.TransferGroupToMatchingServer,
			LuauContext.Protected,
			userIds,
			selectors,
		);
		if (!result.success) throw result.error;
		return result.data;
	}

	/**
	 * Transfers a group of players to another player. The target player must be in the current game.
	 * @param player The player to transfer, either userId or Player object
	 * @param targetUserId The userId of the target player.
	 * @param config The configuration for the transfer {@link AirshipPlayerTransferConfig}
	 */
	public async TransferToPlayer(player: Player | string, targetUserId: string, config?: AirshipPlayerTransferConfig) {
		return await this.TransferGroupToPlayer([player], targetUserId, config);
	}

	/**
	 * Transfers a group of players to another player. The target player must be in the current game.
	 * @param players The players to transfer, either userIds or Player objects
	 * @param targetUserId The userId of the target player.
	 * @param config The configuration for the transfer {@link AirshipPlayerTransferConfig}
	 */
	public async TransferGroupToPlayer(
		players: (Player | string)[],
		targetUserId: string,
		config?: AirshipPlayerTransferConfig,
	) {
		let userIds: string[] = players.map((player) => (typeIs(player, "table") ? player.userId : player));
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiTransferGroupToPlayer>(
			TransferServiceBridgeTopics.TransferGroupToPlayer,
			LuauContext.Protected,
			userIds,
			targetUserId,
			config,
		);
		if (!result.success) throw result.error;
		return result.data;
	}
}
