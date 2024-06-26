import {
	ClientBridgeApiRequestPurchase,
	PurchaseControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/Purchase/PurchaseController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { AirshipUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";

/**
 * Prompt players to buy products in your game.
 */
@Controller({})
export class AirshipPurchaseController {
	constructor() {
		if (!Game.IsClient()) return;

		Platform.Client.Purchase = this;
	}

	protected OnStart(): void {}

	/**
	 * Opens a purchase dialog for the user. It will prompt them to confirm the purchase provided.
	 * If the user completes the purchase, a receipt fulfillment event will be fired on the server.
	 * @param config productId is the product to be purchased. You can find the ID in the create dashboard.
	 * quantity is the amount of this product to purchase. targetUserId is the user that will receive the
	 * product. If not provided, it defaults to the local player.
	 * @returns true if the prompt was displayed, false otherwise.
	 */
	public async RequestPurchase(config: {
		productId: string;
		quantity: number;
		targetUserId?: string;
	}): Promise<Result<undefined, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<ClientBridgeApiRequestPurchase>(
			PurchaseControllerBridgeTopics.RequestPurchase,
			config.productId,
			config.quantity,
			config.targetUserId ?? Game.localPlayer.userId,
		);
	}
}
