import { Controller, OnStart } from "@easy-games/flamework-core";
import { EquippedProfilePicture, Outfit } from "Shared/Airship/Types/Outputs/PlatformInventory";
import { Result } from "Shared/Types/Result";
import { DecodeJSON } from "Shared/json";

/**
 * This controller allows access to the current players platform inventory. Platform inventory
 * is managed by game servers and configured on the https://create.airship.gg website.
 */
@Controller({})
export class PlatformInventoryController implements OnStart {
	OnStart(): void {}

	/**
	 * Gets the users equipped profile picture.
	 * @param userId The userId
	 */
	public async GetEquippedProfilePictureByUserId(userId: string): Promise<Result<EquippedProfilePicture, undefined>> {
		const res = await AirshipInventoryControllerBackend.GetEquippedProfilePictureByUserId(userId);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data) as EquippedProfilePicture,
		};
	}

	/**
	 * Gets the users currently equipped outfit.
	 */
	public async GetEquippedOutfitByUserId(userId: string): Promise<Result<Outfit | undefined, undefined>> {
		const res = await AirshipInventoryControllerBackend.GetEquippedOutfitByUserId(userId);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data) as Outfit,
		};
	}
}
