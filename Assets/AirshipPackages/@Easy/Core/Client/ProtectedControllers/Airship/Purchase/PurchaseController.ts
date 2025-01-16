import { AirshipProduct } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipPurchase";
import { PublicUser } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipUser";
import { Controller, Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { ProtectedUserController } from "../User/UserController";
import { RetryHttp } from "@Easy/Core/Shared/Http/HttpRetry";

export const enum PurchaseControllerBridgeTopics {
	RequestPurchase = "PurchaseController:RequestPurchase",
}

export type ClientBridgeApiRequestPurchase = (productId: string, quantity: number, userId: string) => boolean;

@Controller({})
export class ProtectedPurchaseController {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<ClientBridgeApiRequestPurchase>(
			PurchaseControllerBridgeTopics.RequestPurchase,
			(_, productId, quantity, userId) => {
				let targetUser: PublicUser | undefined = Protected.user.WaitForLocalUser(); // This shouldn't be undefined but it is
				if (userId !== targetUser?.uid) {
					targetUser = Dependency<ProtectedUserController>().GetUserById(userId).expect();
				}

				if (!targetUser) {
					warn("Invalid target user for purchase.");
					return false;
				}

				const res = RetryHttp(() => InternalHttpManager.PostAsync(
					`${AirshipUrl.ContentService}/shop/purchase/validate`,
					json.encode({
						productId,
						receiverUid: targetUser.uid,
						quantity,
					}),
				), { retryKey: "post/content-service/shop/purchase/validate" }).expect();

				if (!res.success || res.statusCode > 299 || !res.data) {
					warn(`Unable to validate purchase. Status Code: ${res.statusCode}.\n`, res.error);
					return false;
				}

				const validationData = json.decode(res.data) as {
					total: number;
					quantity: number;
					productId: string;
					product: AirshipProduct;
				};

				// TODO: Prompt user with this info. Basically the confirm box that Roblox brings up when you are about to spend robux.
				// The confirm model should call "PerformPurchase" if the user accepts.
				const promptData = {
					...validationData,
					targetUser,
				};
				return true;
			},
		);
	}

	protected OnStart(): void {}

	public PerformPurchase(config: { productId: string; receiverUid: string; quantity: number; total: number }): void {
		const res = RetryHttp(() =>
			InternalHttpManager.PostAsync(`${AirshipUrl.ContentService}/shop/purchase`, json.encode(config)),
			{ retryKey: "post/content-service/shop/purchase" },
		).expect();

		if (!res.success || res.statusCode > 299) {
			warn(`Purchase failed. Status Code: ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		const receiptData = json.decode(res.data) as { receiptId: string };
		// Notify server of receipt so that it can process it
	}
}
