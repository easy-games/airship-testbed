import {
	AirshipGameTransferConfig,
	AirshipMatchingServerTransferConfig,
	AirshipPlayerTransferConfig,
	AirshipServerConfig,
	AirshipServerTransferConfig,
} from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipTransfers";
import { CreateServerResponse } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipTransfers";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

export const enum TransferServiceBridgeTopics {
	CreateServer = "TransferService:CreateServer",
	TransferGroupToGame = "TransferService:TransferGroupToGame",
	TransferGroupToServer = "TransferService:TransferGroupToServer",
	TransferGroupToMatchingServer = "TransferService:TransferGroupToMatchingServer",
	TransferGroupToPlayer = "TransferService:TransferGroupToPlayer",
}

export type ServerBridgeApiCreateServer = (config?: AirshipServerConfig) => Result<CreateServerResponse, string>;
export type ServerBridgeApiTransferGroupToGame = (
	userIds: string[],
	gameId: string,
	config?: AirshipGameTransferConfig,
) => Result<undefined, string>;
export type ServerBridgeApiTransferGroupToServer = (
	userIds: string[],
	serverId: string,
	config?: AirshipServerTransferConfig,
) => Result<undefined, string>;
export type ServerBridgeApiTransferGroupToMatchingServer = (
	userIds: string[],
	config: AirshipMatchingServerTransferConfig,
) => Result<undefined, string>;
export type ServerBridgeApiTransferGroupToPlayer = (
	userIds: string[],
	targetUserId: string,
	config?: AirshipPlayerTransferConfig,
) => Result<undefined, string>;

@Service({})
export class ProtectedTransferService {
	constructor() {
		contextbridge.callback<ServerBridgeApiCreateServer>(TransferServiceBridgeTopics.CreateServer, (_, config) => {
			const [success, result] = this.CreateServer(config).await();
			if (!success) {
				return { success: false, error: "Unable to complete request." };
			}
			return result;
		});

		contextbridge.callback<ServerBridgeApiTransferGroupToGame>(
			TransferServiceBridgeTopics.TransferGroupToGame,
			(_, players, gameId, config) => {
				const [success, result] = this.TransferGroupToGame(players, gameId, config).await();
				if (!success) {
					return {
						success: false,
						error: "Unable to complete request.",
					};
				}
				return result;
			},
		);

		contextbridge.callback<ServerBridgeApiTransferGroupToServer>(
			TransferServiceBridgeTopics.TransferGroupToServer,
			(_, players, serverId, config) => {
				const [success, result] = this.TransferGroupToServer(players, serverId, config).await();
				if (!success) {
					return {
						success: false,
						error: "Unable to complete request.",
					};
				}
				return result;
			},
		);

		contextbridge.callback<ServerBridgeApiTransferGroupToMatchingServer>(
			TransferServiceBridgeTopics.TransferGroupToMatchingServer,
			(_, players, config) => {
				const [success, result] = this.TransferGroupToMatchingServer(players, config).await();
				if (!success) {
					return {
						success: false,
						error: "Unable to complete request.",
					};
				}
				return result;
			},
		);

		contextbridge.callback<ServerBridgeApiTransferGroupToPlayer>(
			TransferServiceBridgeTopics.TransferGroupToPlayer,
			(_, players, targetUserId, config) => {
				const [success, result] = this.TransferGroupToPlayer(players, targetUserId, config).await();
				if (!success) {
					return {
						success: false,
						error: "Unable to complete request.",
					};
				}
				return result;
			},
		);
	}

	public async CreateServer(config?: AirshipServerConfig): Promise<ReturnType<ServerBridgeApiCreateServer>> {
		const res = InternalHttpManager.PostAsync(
			`${AirshipUrl.GameCoordinator}/servers/create`,
			EncodeJSON({
				sceneId: config?.sceneId,
				region: config?.region,
				accessMode: config?.accessMode,
				allowedUids: config?.allowedUserIds,
				maxPlayers: config?.maxPlayers,
				tags: config?.tags,
			}),
		);

		if (!res.success && res.statusCode > 299) {
			warn(`Unable to create server. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				error: res.error,
			};
		}

		return {
			success: true,
			data: DecodeJSON<{
				serverId: string;
			}>(res.data),
		};
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
			return {
				success: false,
				error: res.error,
			};
		}

		return {
			success: true,
			data: undefined,
		};
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
			return {
				success: false,
				error: res.error,
			};
		}

		return {
			success: true,
			data: undefined,
		};
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
			return {
				success: false,
				error: res.error,
			};
		}

		return {
			success: true,
			data: undefined,
		};
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
			return {
				success: false,
				error: res.error,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}
}
