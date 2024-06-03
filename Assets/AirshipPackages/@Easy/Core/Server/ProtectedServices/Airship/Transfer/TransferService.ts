import { AirshipServerConfig } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipTransfers";
import { CreateServerResponse } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipTransfers";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

export enum TransferServiceBridgeTopics {
	CreateServer = "TransferService:CreateServer",
	TransferGroupToGame = "TransferService:TransferGroupToGame",
	TransferGroupToServer = "TransferService:TransferGroupToServer",
}

export type ServerBridgeApiCreateServer = (config?: AirshipServerConfig) => Result<CreateServerResponse, undefined>;
export type ServerBridgeApiTransferGroupToGame = (
	players: readonly Player[],
	gameId: string,
	sceneId?: string,
	serverTransferData?: unknown,
	clientTransferData?: unknown,
) => Result<undefined, undefined>;
export type ServerBridgeApiTransferGroupToServer = (
	players: readonly Player[],
	serverId: string,
	serverTransferData?: unknown,
	clientTransferData?: unknown,
) => Result<undefined, undefined>;

@Service({})
export class TransferService implements OnStart {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiCreateServer>(TransferServiceBridgeTopics.CreateServer, (_, config) => {
			const res = InternalHttpManager.PostAsync(
				`${AirshipUrl.GameCoordinator}/servers/create`,
				EncodeJSON({
					sceneId: config?.sceneId,
					region: config?.region,
					accessMode: config?.accessMode,
					allowedUids: config?.allowedUserIds,
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
		});

		contextbridge.callback<ServerBridgeApiTransferGroupToGame>(
			TransferServiceBridgeTopics.TransferGroupToGame,
			(_, players, gameId, sceneId, serverTransferData, clientTransferData) => {
				const res = InternalHttpManager.PostAsync(
					`${AirshipUrl.GameCoordinator}`,
					EncodeJSON({
						uid: players.map((p) => p.userId),
						gameId,
						sceneId,
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
			},
		);

		contextbridge.callback<ServerBridgeApiTransferGroupToServer>(
			TransferServiceBridgeTopics.TransferGroupToServer,
			(_, players, serverId, serverTransferData, clientTransferData) => {
				const res = InternalHttpManager.PostAsync(
					`${AirshipUrl.GameCoordinator}/transfers/transfer`,
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
			},
		);
	}

	OnStart(): void {}
}
