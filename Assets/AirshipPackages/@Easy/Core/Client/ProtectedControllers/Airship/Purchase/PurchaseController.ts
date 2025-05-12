import { Controller, Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { ProtectedUserController } from "../User/UserController";
import { ContentServiceClient, ContentServicePurchase } from "@Easy/Core/Shared/TypePackages/content-service-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { GameCoordinatorUsers } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";

export const enum PurchaseControllerBridgeTopics {
	RequestPurchase = "PurchaseController:RequestPurchase",
}

export type ClientBridgeApiRequestPurchase = (productId: string, quantity: number, userId: string) => boolean;

const client = new ContentServiceClient(UnityMakeRequest(AirshipUrl.ContentService));

@Controller({})
export class ProtectedPurchaseController {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<ClientBridgeApiRequestPurchase>(
			PurchaseControllerBridgeTopics.RequestPurchase,
			(_, productId, quantity, userId) => {
				let targetUser: GameCoordinatorUsers.PublicUser | undefined = Protected.User.WaitForLocalUser(); // This shouldn't be undefined but it is
				if (userId !== targetUser?.uid) {
					targetUser = Dependency<ProtectedUserController>().GetUserById(userId).expect();
				}

				if (!targetUser) {
					warn("Invalid target user for purchase.");
					return false;
				}

				let validationData;
				try {
					validationData = client.purchase
						.validatePurchase({ productId, receiverUid: targetUser.uid, quantity })
						.expect();
				} catch {
					return false;
				}

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

	public PerformPurchase(config: ContentServicePurchase.PurchaseDto): void {
		const receiptData = client.purchase.purchase(config).expect();
		// Notify server of receipt so that it can process it
	}
}
