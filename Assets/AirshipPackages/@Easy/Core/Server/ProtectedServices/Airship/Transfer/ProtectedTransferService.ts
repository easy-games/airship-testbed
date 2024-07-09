import {
	AirshipGameTransferConfig,
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
}

export type ServerBridgeApiCreateServer = (config?: AirshipServerConfig) => Result<CreateServerResponse, undefined>;
export type ServerBridgeApiTransferGroupToGame = (
	userIds: string[],
	gameId: string,
	config?: AirshipGameTransferConfig,
) => Result<undefined, undefined>;
export type ServerBridgeApiTransferGroupToServer = (
	userIds: string[],
	serverId: string,
	config?: AirshipServerTransferConfig,
) => Result<undefined, undefined>;

@Service({})
export class ProtectedTransferService {
	private serverBootstrap: ServerBootstrap;

	constructor() {
		this.serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>()!;

		contextbridge.callback<ServerBridgeApiCreateServer>(TransferServiceBridgeTopics.CreateServer, (_, config) => {
			const [success, result] = this.CreateServer(config).await();
			if (!success) {
				return { success: false, data: undefined };
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
						data: undefined,
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
						data: undefined,
					};
				}
				return result;
			},
		);
	}

	public async CreateServer(config?: AirshipServerConfig): Promise<Result<CreateServerResponse, undefined>> {
		const res = InternalHttpManager.PostAsync(
			`${AirshipUrl.GameCoordinator}/servers/create`,
			EncodeJSON({
				sceneId: config?.sceneId,
				region: config?.region,
				accessMode: config?.accessMode,
				allowedUids: config?.allowedUserIds,
				maxPlayers: config?.maxPlayers,
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

	public async TransferGroupToGame(
		players: readonly (string | Player)[],
		gameId: string,
		config?: AirshipGameTransferConfig,
	): Promise<Result<undefined, undefined>> {
		const res = InternalHttpManager.PostAsync(
			`${AirshipUrl.GameCoordinator}/transfers/transfer`,
			EncodeJSON({
				uids: players.map((p) => (typeIs(p, "string") ? p : p.userId)),
				gameId,
				preferredServerId: config?.preferredServerId,
				sceneId: config?.sceneId,
				maxPlayers: config?.maxPlayers,
				region: config?.region,
				serverTransferData: config?.serverTransferData,
				clientTransferData: config?.clientTransferData,
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

	public async TransferGroupToServer(
		players: readonly (string | Player)[],
		serverId: string,
		config?: AirshipServerTransferConfig,
	): Promise<Result<undefined, undefined>> {
		const res = InternalHttpManager.PostAsync(
			`${AirshipUrl.GameCoordinator}/transfers/transfer`,
			EncodeJSON({
				uids: players.map((p) => (typeIs(p, "string") ? p : p.userId)),
				serverId,
				serverTransferData: config?.serverTransferData,
				clientTransferData: config?.clientTransferData,
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

	private FireOnShutdown(): void {
		print("FireOnShutdown");
		let done = false;

		const Done = () => {
			if (done) return;
			done = true;

			this.serverBootstrap.Shutdown();
		};

		task.delay(30, () => {
			Done();
		});
		task.spawn(() => {
			contextbridge.invoke("ServerShutdown", LuauContext.Game);
			Done();
		});
	}

	protected OnStart(): void {
		this.serverBootstrap.onProcessExit(() => {
			this.FireOnShutdown();
		});
	}
}
