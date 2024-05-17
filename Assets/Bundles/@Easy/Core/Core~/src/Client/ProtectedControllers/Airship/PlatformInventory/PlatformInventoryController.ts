import { Platform } from "@Easy/Core/Shared/Airship";
import { OutfitDto } from "@Easy/Core/Shared/Airship/Types/Outputs/PlatformInventory";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";

@Controller({})
export class PlatformInventoryController implements OnStart {
	constructor() {
		if (Game.IsClient()) Platform.client.inventory = this;
	}

	OnStart(): void {}

	/**
	 * Gets the users currently equipped outfit.
	 */
	public async GetEquippedOutfitByUserId(userId: string): Promise<Result<OutfitDto | undefined, undefined>> {
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.ContentService}/outfits/uid/${userId}/equipped`);

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
