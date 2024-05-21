import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { EncodeJSON } from "@Easy/Core/Shared/json";

export enum TransferControllerBridgeTopics {
	TransferToGame = "TransferController:TransferToGame",
	TransferToPartyLeader = "TransferController:TransferToPartyLeader",
}

export type BridgeApiTransferToGame = (gameId: string, preferredServerId?: string) => Result<undefined, undefined>;
export type BridgeApiTransferToPartyLeader = () => Result<undefined, undefined>;

@Controller({})
export class TransferController implements OnStart {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<BridgeApiTransferToGame>(
			TransferControllerBridgeTopics.TransferToGame,
			(_, gameId, preferredServerId) => {
				const res = InternalHttpManager.PostAsync(
					`${AirshipUrl.GameCoordinator}/transfers/transfer/self`,
					EncodeJSON({
						gameId: gameId,
						preferredServerId,
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

		contextbridge.callback<BridgeApiTransferToPartyLeader>(
			TransferControllerBridgeTopics.TransferToPartyLeader,
			(_) => {
				const res = InternalHttpManager.PostAsync(
					`${AirshipUrl.GameCoordinator}/transfers/transfer/self/party`,
					"",
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
