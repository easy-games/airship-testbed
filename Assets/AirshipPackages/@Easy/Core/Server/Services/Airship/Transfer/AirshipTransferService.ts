import {
	ServerBridgeApiTransferGroupToGame,
	ServerBridgeApiTransferGroupToMatchingServer,
	ServerBridgeApiTransferGroupToPlayer,
	ServerBridgeApiTransferGroupToServer,
	TransferServiceBridgeTopics,
} from "@Easy/Core/Server/ProtectedServices/Airship/Transfer/ProtectedTransferService";
import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { GameCoordinatorTransfers } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
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
		if (!Game.IsServer()) return;

		Platform.Server.Transfer = this;
	}

	protected OnStart(): void {
		contextbridge.callback("ServerShutdown", (from) => {
			this.onShutdown.Fire();

			if (this.transferPlayersOnShutdown) {
				// todo: if this fails, try transferring everyone individually
				const players = Airship.Players.GetPlayers();
				if (players.size() === 0) {
					return;
				} else {
					const res = this.TransferGroupToGame(Airship.Players.GetPlayers(), Game.gameId).expect();
					if (!res.transfersRequested) {
						for (let player of Airship.Players.GetPlayers()) {
							this.TransferGroupToGame([player], Game.gameId).expect();
						}
					}
					let maxWaitTime = 10;
					let numWaits = 0;
					while (numWaits < maxWaitTime) {
						task.unscaledWait(1);
						numWaits++;
						const players = Airship.Players.GetPlayers();
						if (players.size() === 0) {
							break;
						}
					}
				}
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
		config?: Omit<GameCoordinatorTransfers.TransferToGameDto, "uids" | "gameId">,
	): Promise<GameCoordinatorTransfers.TransferResult> {
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
		config?: Omit<GameCoordinatorTransfers.TransferToGameDto, "uids" | "gameId">,
	): Promise<GameCoordinatorTransfers.TransferResult> {
		let userIds: string[] = players.map((player) => (typeIs(player, "table") ? player.userId : player));
		return contextbridge.invoke<ServerBridgeApiTransferGroupToGame>(
			TransferServiceBridgeTopics.TransferGroupToGame,
			LuauContext.Protected,
			userIds,
			gameId,
			config,
		);
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
		config?: Omit<GameCoordinatorTransfers.TransferToServerIdDto, "uids" | "serverId">,
	): Promise<GameCoordinatorTransfers.TransferResult> {
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
		config?: Omit<GameCoordinatorTransfers.TransferToServerIdDto, "uids" | "serverId">,
	): Promise<GameCoordinatorTransfers.TransferResult> {
		let userIds: string[] = players.map((player) => (typeIs(player, "table") ? player.userId : player));
		return contextbridge.invoke<ServerBridgeApiTransferGroupToServer>(
			TransferServiceBridgeTopics.TransferGroupToServer,
			LuauContext.Protected,
			userIds,
			serverId,
			config,
		);
	}

	/**
	 * Transfers a player to a server that matches the provided configuration. If any of the configuration
	 * parameters are missing, they will be ignored when selecting a server.
	 * @param players The player to transfer, either userId or Player object
	 * @param selectors The configuration for selecting a server. {@link AirshipMatchingServerTransferConfig}
	 */
	public async TransferToMatchingServer(
		player: Player | string,
		selectors: Omit<GameCoordinatorTransfers.TransferToMatchingServerDto, "uids">,
	): Promise<GameCoordinatorTransfers.TransferResult> {
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
		selectors: Omit<GameCoordinatorTransfers.TransferToMatchingServerDto, "uids">,
	): Promise<GameCoordinatorTransfers.TransferResult> {
		let userIds: string[] = players.map((player) => (typeIs(player, "table") ? player.userId : player));
		return contextbridge.invoke<ServerBridgeApiTransferGroupToMatchingServer>(
			TransferServiceBridgeTopics.TransferGroupToMatchingServer,
			LuauContext.Protected,
			userIds,
			selectors,
		);
	}

	/**
	 * Transfers a group of players to another player. The target player must be in the current game.
	 * @param player The player to transfer, either userId or Player object
	 * @param targetUserId The userId of the target player.
	 * @param config The configuration for the transfer {@link AirshipPlayerTransferConfig}
	 */
	public async TransferToPlayer(
		player: Player | string,
		targetUserId: string,
		config?: Omit<GameCoordinatorTransfers.TransferToPlayerDto, "uids" | "targetUserId">,
	): Promise<GameCoordinatorTransfers.TransferResult> {
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
		config?: Omit<GameCoordinatorTransfers.TransferToPlayerDto, "uids" | "targetUserId">,
	): Promise<GameCoordinatorTransfers.TransferResult> {
		let userIds: string[] = players.map((player) => (typeIs(player, "table") ? player.userId : player));
		return contextbridge.invoke<ServerBridgeApiTransferGroupToPlayer>(
			TransferServiceBridgeTopics.TransferGroupToPlayer,
			LuauContext.Protected,
			userIds,
			targetUserId,
			config,
		);
	}
}
