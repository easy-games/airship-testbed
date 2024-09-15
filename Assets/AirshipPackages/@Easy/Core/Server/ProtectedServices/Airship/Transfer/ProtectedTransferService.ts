import {
	AirshipGameTransferConfig,
	AirshipMatchingServerTransferConfig,
	AirshipPlayerTransferConfig,
	AirshipServerTransferConfig,
} from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipTransfers";
import { TransferResult } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipTransfers";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

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
) => TransferResult;
export type ServerBridgeApiTransferGroupToServer = (
	userIds: string[],
	serverId: string,
	config?: AirshipServerTransferConfig,
) => TransferResult;
export type ServerBridgeApiTransferGroupToMatchingServer = (
	userIds: string[],
	config: AirshipMatchingServerTransferConfig,
) => TransferResult;
export type ServerBridgeApiTransferGroupToPlayer = (
	userIds: string[],
	targetUserId: string,
	config?: AirshipPlayerTransferConfig,
) => TransferResult;

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
		config?: AirshipGameTransferConfig,
	): Promise<ReturnType<ServerBridgeApiTransferGroupToGame>> {
		const res = InternalHttpManager.PostAsync(
			`${AirshipUrl.GameCoordinator}/transfers/transfer/target/game`,
			EncodeJSON({
				uids: players.map((p) => (typeIs(p, "string") ? p : p.userId)),
				gameId,
				preferredServerId: config?.preferredServerId,
				serverTransferData: config?.serverTransferData,
				clientTransferData: config?.clientTransferData,
			}),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete transfer request. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return DecodeJSON(res.data) as TransferResult;
	}

	public async TransferGroupToServer(
		players: readonly (string | Player)[],
		serverId: string,
		config?: AirshipServerTransferConfig,
	): Promise<ReturnType<ServerBridgeApiTransferGroupToServer>> {
		const res = InternalHttpManager.PostAsync(
			`${AirshipUrl.GameCoordinator}/transfers/transfer/target/server`,
			EncodeJSON({
				uids: players.map((p) => (typeIs(p, "string") ? p : p.userId)),
				serverId,
				serverTransferData: config?.serverTransferData,
				clientTransferData: config?.clientTransferData,
			}),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete transfer request. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return DecodeJSON(res.data) as TransferResult;
	}

	public async TransferGroupToMatchingServer(
		players: readonly (string | Player)[],
		config: AirshipMatchingServerTransferConfig,
	): Promise<ReturnType<ServerBridgeApiTransferGroupToMatchingServer>> {
		const res = InternalHttpManager.PostAsync(
			`${AirshipUrl.GameCoordinator}/transfers/transfer/target/matching`,
			EncodeJSON({
				uids: players.map((p) => (typeIs(p, "string") ? p : p.userId)),
				sceneId: config.sceneId,
				maxPlayers: config.maxPlayers,
				regions: config.regions,
				tag: config.tag,
				accessMode: config.accessMode,
				serverTransferData: config.serverTransferData,
				clientTransferData: config.clientTransferData,
			}),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete transfer request. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return DecodeJSON(res.data) as TransferResult;
	}

	public async TransferGroupToPlayer(
		players: readonly (string | Player)[],
		targetUserId: string,
		config?: AirshipPlayerTransferConfig,
	): Promise<ReturnType<ServerBridgeApiTransferGroupToPlayer>> {
		const res = InternalHttpManager.PostAsync(
			`${AirshipUrl.GameCoordinator}/transfers/transfer/target/player`,
			EncodeJSON({
				uids: players.map((p) => (typeIs(p, "string") ? p : p.userId)),
				targetUserId,
				serverTransferData: config?.serverTransferData,
				clientTransferData: config?.clientTransferData,
			}),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete transfer request. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return DecodeJSON(res.data) as TransferResult;
	}
}
