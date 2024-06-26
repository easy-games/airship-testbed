import { AirshipPurchaseReceipt } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipPurchase";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

@Service({})
export class ProtectedPurchaseService implements OnStart {
	constructor() {
		if (!Game.IsServer()) return;
	}

	OnStart(): void {}

	/**
	 * Processes a receipt recieved from a client. This involves making the claim on the receipt,
	 */
	public ProcessReceipt(receiptId: string) {
		const res = InternalHttpManager.PostAsync(
			`${AirshipUrl.ContentService}/shop/purchase/receipt/claim`,
			EncodeJSON({ receiptId }),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to claim receipt. Status Code: ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		const receipt = DecodeJSON(res.data) as AirshipPurchaseReceipt;

		try {
			// Process receipt by calling game callback
			const result = false || true;
			if (result) {
				InternalHttpManager.PostAsync(
					`${AirshipUrl.ContentService}/shop/purchase/receipt/complete`,
					EncodeJSON({
						receiptId,
						result: "COMPLETED",
					}),
				);
				return;
			}
		} catch (err) {}

		InternalHttpManager.PostAsync(
			`${AirshipUrl.ContentService}/shop/purchase/receipt/complete`,
			EncodeJSON({
				receiptId,
				result: "FAILED",
			}),
		);
	}
}
