import {
	ClientBridgeApiRequestPurchase,
	PurchaseControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/Purchase/PurchaseController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { AirshipUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Controller, Dependency, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { PlayersSingleton } from "@Easy/Core/Shared/Player/PlayersSingleton";

/**
 * Prompt players to buy products in your game.
 */
@Service({})
@Controller({})
export class AirshipPurchaseSingleton {
	constructor() {
		Platform.Client.Purchase = this;
	}

	protected OnStart(): void {
		// Hook into server requests to prompt purchase
		if (RunCore.IsClient()) {
			CoreNetwork.ServerToClient.Purchase.PromptPurchase.client.SetCallback((productId, quantity, recipientId) => {
				const [success, promptDisplayed] = this.PromptPurchase(productId, quantity, Game.localPlayer.userId, recipientId).await();
				return success && promptDisplayed;
			});
		}
	}

	/**
	 * Opens a purchase dialog for the user. It will prompt them to confirm the purchase provided.
	 * If the user completes the purchase, a receipt fulfillment event will be fired on the server.
	 * 
	 * @param productId The product to be purchased. You can find the ID in the create dashboard.
	 * @param quantity The amount of this product to purchase.
	 * @param purchaserUserId The user that will purchase the product. If called on client this defaults to the local player id.
	 * @param recipientUserId The user that will receive the product. If not provided, it defaults to {@link purchaserUserId}.
	 * @returns ``true`` if the prompt was displayed.
	 */
	public async PromptPurchase(
		productId: string,
		quantity: number,
		purchaserUserId?: string,
		recipientUserId?: string,
	): Promise<boolean> {
		// Handle calling on server
		if (!RunCore.IsClient()) {
			if (!purchaserUserId) {
				warn("Failed to prompt purchase: Must specify a purchaserUserId when prompting purchase from the server.");
				return false;
			}

			const purchaserPlayer = Dependency<PlayersSingleton>().FindByUserId(purchaserUserId);
			if (!purchaserPlayer) {
				warn("Failed to prompt purchase: Purchaser player is not online.");
				return false;
			}

			// Send remote to client to display purchase prompt
			const result = CoreNetwork.ServerToClient.Purchase.PromptPurchase.server.FireClient(purchaserPlayer, productId, quantity, recipientUserId);
			return result;
		} else {
			// Set purchaser user id if undefined
			if (purchaserUserId === undefined) purchaserUserId = Game.localPlayer.userId;
			// Error if requesting someone else as the purchaser
			if (purchaserUserId !== Game.localPlayer.userId) {
				warn("Failed to prompt purchase: Cannot prompt purchase for non-local user.");
				return false;
			}
		}

		if (!recipientUserId) {
			recipientUserId = purchaserUserId;
		}

		return await AirshipUtil.PromisifyBridgeInvoke<ClientBridgeApiRequestPurchase>(
			PurchaseControllerBridgeTopics.RequestPurchase,
			LuauContext.Protected,
			productId,
			quantity,
			recipientUserId,
		);
	}
}
