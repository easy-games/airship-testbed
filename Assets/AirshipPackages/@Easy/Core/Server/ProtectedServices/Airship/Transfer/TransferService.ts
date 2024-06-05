import {
	AirshipGameTransferConfig,
	AirshipServerConfig,
	AirshipServerTransferConfig,
} from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipTransfers";
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
	players: readonly (Player | string)[],
	gameId: string,
	config?: AirshipGameTransferConfig,
) => Result<undefined, undefined>;
export type ServerBridgeApiTransferGroupToServer = (
	players: readonly (Player | string)[],
	serverId: string,
	config?: AirshipServerTransferConfig,
) => Result<undefined, undefined>;

@Service({})
export class ProtectedTransferService implements OnStart {
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
			(_, players, gameId, config) => {
				const res = InternalHttpManager.PostAsync(
					`${AirshipUrl.GameCoordinator}/transfers/transfer`,
					EncodeJSON({
						uids: players.map((p) => (typeIs(p, "string") ? p : p.userId)),
						gameId,
						preferredServerId: config?.preferredServerId,
						sceneId: config?.sceneId,
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
			},
		);

		contextbridge.callback<ServerBridgeApiTransferGroupToServer>(
			TransferServiceBridgeTopics.TransferGroupToServer,
			(_, players, serverId, config) => {
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
			},
		);
	}

	OnStart(): void {}
}
