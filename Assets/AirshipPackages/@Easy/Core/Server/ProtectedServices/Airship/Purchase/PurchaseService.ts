import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { ContentServiceClient } from "@Easy/Core/Shared/TypePackages/content-service-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

const client = new ContentServiceClient(UnityMakeRequest(AirshipUrl.ContentService));

@Service({})
export class ProtectedPurchaseService {
	constructor() {
		if (!Game.IsServer()) return;
	}

	protected OnStart(): void {}

	/**
	 * Processes a receipt recieved from a client. This involves making the claim on the receipt,
	 */
	public ProcessReceipt(receiptId: string) {
		try {
			client.purchase.claimReceipt({ receiptId }).expect();
		} catch (err) {
			return {
				success: false,
				data: undefined,
			};
		}

		try {
			// Process receipt by calling game callback
			const result = false || true;
			if (result) {
				client.purchase.completeReceipt({ receiptId, result: "COMPLETED" }).expect();
				return;
			}
		} catch (err) {}

		client.purchase.completeReceipt({ receiptId, result: "FAILED" }).expect();
	}
}
