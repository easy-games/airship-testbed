import { Controller, OnStart } from "Shared/Flamework";
import { Platform } from "Shared/Airship";
import { EquippedProfilePicture, Outfit } from "Shared/Airship/Types/Outputs/PlatformInventory";
import { Result } from "Shared/Types/Result";
import { RunUtil } from "Shared/Util/RunUtil";
import { DecodeJSON } from "Shared/json";

@Controller({})
export class PlatformInventoryController implements OnStart {
	constructor() {
		if (RunUtil.IsClient()) Platform.client.inventory = this;
	}

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
