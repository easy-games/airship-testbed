import {
	ClientBridgeApiTransferRequested,
	TransferControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Transfer/TransferController";
import { Platform } from "@Easy/Core/Shared/Airship";
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

		contextbridge.callback<ClientBridgeApiTransferRequested>(
			TransferControllerBridgeTopics.TransferRequested,
			(_, transfer) => {
				this.onTransferRequested.Fire(transfer);
			},
		);
	}

	protected OnStart(): void {}
}
