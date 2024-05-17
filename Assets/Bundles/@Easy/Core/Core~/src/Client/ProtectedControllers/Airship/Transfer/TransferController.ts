import { Platform } from "@Easy/Core/Shared/Airship";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { EncodeJSON } from "@Easy/Core/Shared/json";

@Controller({})
export class TransferController implements OnStart {
	constructor() {
		if (Game.IsClient()) Platform.client.transfer = this;
	}

	OnStart(): void {}

	/**
	 * Submits a request to transfer to the provided game id. The client can optionally request to transfer
	 * to a specific server of the given game by providing the perferred server id. It is possible that the
	 * client will be transferred to a different server if the perferred server is full or was not allocated
	 * with the default scene.
	 * @param gameId Game id to join.
	 * @param preferredServerId Specific ServerID to teleport to. If not included, the backend will select a server for you.
	 */
	public async TransferToGameAsync(
		gameId: string,
		preferredServerId?: string,
	): Promise<Result<undefined, undefined>> {
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
	}

	/**
	 * Submits a request to transfer to the current party leader. If the party leader is not in a game,
	 * or the client is not in a party, this function will have no effect.
	 */
	public async TransferToPartyLeader(): Promise<Result<undefined, undefined>> {
		const res = InternalHttpManager.PostAsync(`${AirshipUrl.GameCoordinator}/transfers/transfer/self/party`, "");

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
}
