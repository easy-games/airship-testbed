import { AirshipPurchaseReceipt } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipPurchase";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { HttpRetryInstance } from "@Easy/Core/Shared/Http/HttpRetry";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

@Service({})
export class ProtectedPurchaseService {
	private readonly httpRetry = HttpRetryInstance();

	constructor() {
		if (!Game.IsServer()) return;
	}

	protected OnStart(): void {}

	/**
	 * Processes a receipt recieved from a client. This involves making the claim on the receipt,
	 */
	public ProcessReceipt(receiptId: string) {
		const res = this.httpRetry(
			() => InternalHttpManager.PostAsync(
				`${AirshipUrl.ContentService}/shop/purchase/receipt/claim`,
				json.encode({ receiptId }),
			),
			"ProcessReceipt",
		).expect();

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to claim receipt. Status Code: ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				data: undefined,
			};
		}

		const receipt = json.decode(res.data) as AirshipPurchaseReceipt;

		try {
			// Process receipt by calling game callback
			const result = false || true;
			if (result) {
				this.httpRetry(
					() => InternalHttpManager.PostAsync(
						`${AirshipUrl.ContentService}/shop/purchase/receipt/complete`,
						json.encode({
							receiptId,
							result: "COMPLETED",
						}),
					),
					"CompletePurchaseReceipt",
				).expect();
				return;
			}
		} catch (err) {}

		this.httpRetry(
			() => InternalHttpManager.PostAsync(
				`${AirshipUrl.ContentService}/shop/purchase/receipt/complete`,
				json.encode({
					receiptId,
					result: "FAILED",
				}),
			),
			"CompletePurchaseReceipt",
		).expect();
	}
}
