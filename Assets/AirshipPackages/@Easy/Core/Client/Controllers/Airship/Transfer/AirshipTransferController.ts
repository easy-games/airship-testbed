import {
	ClientBridgeApiTransferToGame,
	ClientBridgeApiTransferToPartyLeader,
	TransferControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Transfer/TransferController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { AirshipTransferResult } from "@Easy/Core/Shared/Airship/Types/AirshipServerManager";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

export interface AirshipTransferRequest {
	gameId: string;
	serverId: string;
}

/**
 * Provides access to user information.
 */
@Controller({})
export class AirshipTransferController {
	/**
	 * Fired when transfering between servers within your game. Does not fire when players exit your game.
	 * If you need to perform actions on exit, use `Airship.Players.onPlayerDisconnected`.
	 */
	public readonly onTransferRequested: Signal<AirshipTransferRequest> =
		new Signal<AirshipTransferRequest>().WithAllowYield(true);

	constructor() {
		if (!Game.IsClient()) return;

		Platform.Client.Transfer = this;

		contextbridge.callback(TransferControllerBridgeTopics.TransferRequested, (_, transfer) => {
			this.onTransferRequested.Fire(transfer);
		});
	}

	/**
	 * Submits a request to transfer to the provided game id. The client can optionally request to transfer
	 * to a specific server of the given game by providing the perferred server id. It is possible that the
	 * client will be transferred to a different server if the perferred server is full or was not allocated
	 * with the default scene.
	 * @param gameId Game id to join.
	 * @param preferredServerId Specific ServerID to teleport to. If not included, the backend will select a server for you.
	 */
	public async TransferToGame(gameId: string, preferredServerId?: string): Promise<AirshipTransferResult> {
		return contextbridge.invoke<ClientBridgeApiTransferToGame>(
			TransferControllerBridgeTopics.TransferToGame,
			LuauContext.Protected,
			gameId,
			preferredServerId,
		);
	}

	/**
	 * Submits a request to transfer to the current party leader. If the party leader is not in a game,
	 * or the client is not in a party, this function will have no effect.
	 */
	public async TransferToPartyLeader(): Promise<AirshipTransferResult> {
		return contextbridge.invoke<ClientBridgeApiTransferToPartyLeader>(
			TransferControllerBridgeTopics.TransferToPartyLeader,
			LuauContext.Protected,
		);
	}

	protected OnStart(): void {}
}
