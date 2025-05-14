import {
	AirshipGameTransferConfig,
	AirshipMatchingServerTransferConfig,
	AirshipPlayerTransferConfig,
	AirshipServerTransferConfig,
	AirshipTransferResult,
} from "@Easy/Core/Shared/Airship/Types/AirshipServerManager";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { GameCoordinatorClient, GameCoordinatorTransfers } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum TransferServiceBridgeTopics {
	TransferGroupToGame = "TransferService:TransferGroupToGame",
	TransferGroupToServer = "TransferService:TransferGroupToServer",
	TransferGroupToMatchingServer = "TransferService:TransferGroupToMatchingServer",
	TransferGroupToPlayer = "TransferService:TransferGroupToPlayer",
}

export type ServerBridgeApiTransferGroupToGame = (
	userIds: string[],
	gameId: string,
	config?: AirshipGameTransferConfig,
) => AirshipTransferResult;
export type ServerBridgeApiTransferGroupToServer = (
	userIds: string[],
	serverId: string,
	config?: AirshipServerTransferConfig,
) => AirshipTransferResult;
export type ServerBridgeApiTransferGroupToMatchingServer = (
	userIds: string[],
	config: AirshipMatchingServerTransferConfig,
) => AirshipTransferResult;
export type ServerBridgeApiTransferGroupToPlayer = (
	userIds: string[],
	targetUserId: string,
	config?: AirshipPlayerTransferConfig,
) => AirshipTransferResult;

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

@Service({})
export class ProtectedTransferService {
	constructor() {
		contextbridge.callback<ServerBridgeApiTransferGroupToGame>(
			TransferServiceBridgeTopics.TransferGroupToGame,
			(_, players, gameId, config) => {
				return this.TransferGroupToGame(players, gameId, config).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiTransferGroupToServer>(
			TransferServiceBridgeTopics.TransferGroupToServer,
			(_, players, serverId, config) => {
				return this.TransferGroupToServer(players, serverId, config).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiTransferGroupToMatchingServer>(
			TransferServiceBridgeTopics.TransferGroupToMatchingServer,
			(_, players, config) => {
				return this.TransferGroupToMatchingServer(players, config).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiTransferGroupToPlayer>(
			TransferServiceBridgeTopics.TransferGroupToPlayer,
			(_, players, targetUserId, config) => {
				return this.TransferGroupToPlayer(players, targetUserId, config).expect();
			},
		);
	}

	public async TransferGroupToGame(
		players: readonly (string | Player)[],
		gameId: string,
		config?: Omit<GameCoordinatorTransfers.TransferToGameDto, "uids" | "gameId">,
	): Promise<ReturnType<ServerBridgeApiTransferGroupToGame>> {
		return await client.transfers.sendToGame({
			uids: players.map((p) => (typeIs(p, "string") ? p : p.userId)),
			gameId,
			preferredServerId: config?.preferredServerId,
			serverTransferData: config?.serverTransferData,
			clientTransferData: config?.clientTransferData,
		});
	}

	public async TransferGroupToServer(
		players: readonly (string | Player)[],
		serverId: string,
		config?: Omit<GameCoordinatorTransfers.TransferToServerIdDto, "uids" | "serverId">,
	): Promise<ReturnType<ServerBridgeApiTransferGroupToServer>> {
		return await client.transfers.sendToServer({
			uids: players.map((p) => (typeIs(p, "string") ? p : p.userId)),
			serverId,
			serverTransferData: config?.serverTransferData,
			clientTransferData: config?.clientTransferData,
		});
	}

	public async TransferGroupToMatchingServer(
		players: readonly (string | Player)[],
		config: Omit<GameCoordinatorTransfers.TransferToMatchingServerDto, "uids">,
	): Promise<ReturnType<ServerBridgeApiTransferGroupToMatchingServer>> {
		return await client.transfers.sendToMatchingServer({
			uids: players.map((p) => (typeIs(p, "string") ? p : p.userId)),
			sceneId: config.sceneId,
			maxPlayers: config.maxPlayers,
			regions: config.regions,
			tag: config.tag,
			accessMode: config.accessMode,
			serverTransferData: config.serverTransferData,
			clientTransferData: config.clientTransferData,
		});
	}

	public async TransferGroupToPlayer(
		players: readonly (string | Player)[],
		targetUserId: string,
		config?: Omit<GameCoordinatorTransfers.TransferToPlayerDto, "uids" | "targetUserId">,
	): Promise<ReturnType<ServerBridgeApiTransferGroupToPlayer>> {
		return await client.transfers.sendToPlayer({
			uids: players.map((p) => (typeIs(p, "string") ? p : p.userId)),
			targetUserId,
			serverTransferData: config?.serverTransferData,
			clientTransferData: config?.clientTransferData,
		});
	}
}
