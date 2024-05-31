import { OutfitDto } from "@Easy/Core/Shared/Airship/Types/Outputs/PlatformInventory";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";

export enum PlatformInventoryControllerBridgeTopics {
	GetEquippedOutfitByUserId = "PlatformInventoryController:GetEquippedOutfitByUserId",
}

export type BridgeApiGetEquippedOutfitByUserId = (userId: string) => Result<OutfitDto | undefined, undefined>;

@Controller({})
export class PlatformInventoryController implements OnStart {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<BridgeApiGetEquippedOutfitByUserId>(
			"PlatformInventoryController:GetEquippedOutfitByUserId",
			(_, userId) => {
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
			},
		);
	}

	OnStart(): void {}
}
