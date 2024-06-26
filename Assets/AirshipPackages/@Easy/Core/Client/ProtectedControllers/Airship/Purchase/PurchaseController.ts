import { AirshipProduct } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipPurchase";
import { PublicUser } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipUser";
import { Controller, Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";
import { ProtectedUserController } from "../User/UserController";

export enum PurchaseControllerBridgeTopics {
	RequestPurchase = "PurchaseController:RequestPurchase",
}

export type ClientBridgeApiRequestPurchase = (
	productId: string,
	quantity: number,
	userId: string,
) => Result<undefined, undefined>;

@Controller({})
export class ProtectedPurchaseController {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<ClientBridgeApiRequestPurchase>(
			PurchaseControllerBridgeTopics.RequestPurchase,
			(_, productId, quantity, userId) => {
				let targetUser: PublicUser | undefined = Protected.user.localUser;
				if (userId !== targetUser?.uid) {
					const res = Dependency<ProtectedUserController>().GetUserById(userId);
					targetUser = res.data;
				}

				if (!targetUser) {
					warn("Invalid target user for purchase.");
					return {
						success: false,
						data: undefined,
					};
				}

				const res = InternalHttpManager.PostAsync(
					`${AirshipUrl.ContentService}/shop/purchase/validate`,
					EncodeJSON({
						productId,
						receiverUid: targetUser.uid,
						quantity,
					}),
				);

				if (!res.success || res.statusCode > 299 || !res.data) {
					warn(`Unable to validate purchase. Status Code: ${res.statusCode}.\n`, res.data);
					return {
						success: false,
						data: undefined,
					};
				}

				const validationData = DecodeJSON(res.data) as {
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

				return {
					success: true,
					data: undefined,
				};
			},
		);
	}

	protected OnStart(): void {}

	public PerformPurchase(config: {
		productId: string;
		receiverUid: string;
		quantity: number;
		total: number;
	}): Result<undefined, undefined> {
		const res = InternalHttpManager.PostAsync(`${AirshipUrl.ContentService}/shop/purchase`, EncodeJSON(config));

		if (!res.success || res.statusCode > 299) {
			warn(`Purchase failed. Status Code: ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		const receiptData = DecodeJSON(res.data) as { receiptId: string };
		// Notify server of receipt so that it can process it

		return {
			success: true,
			data: undefined,
		};
	}
}
