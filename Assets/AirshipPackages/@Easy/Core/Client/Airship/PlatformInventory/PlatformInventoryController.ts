import { Platform } from "@Easy/Core/Shared/Airship";
import { EquippedProfilePicture, OutfitDto } from "@Easy/Core/Shared/Airship/Types/Outputs/PlatformInventory";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { DecodeJSON } from "@Easy/Core/Shared/json";

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
	public async GetEquippedOutfitByUserId(userId: string): Promise<Result<OutfitDto | undefined, undefined>> {
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
			data: DecodeJSON(res.data) as OutfitDto,
		};
	}
}
