import {
	PlatformInventoryServiceBridgeTopics,
	ServerBridgeApiGetItems,
} from "@Easy/Core/Server/ProtectedServices/Airship/PlatformInventory/PlatformInventoryService";
import { ItemQueryParameters } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipPlatformInventory";
import { ItemInstanceDto } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipPlatformInventory";
import { PlatformInventoryUtil } from "@Easy/Core/Shared/Airship/Util/PlatformInventoryUtil";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";

export const enum PlatformInventoryControllerBridgeTopics {
	GetItems = "PartyControllerGetInventory",
}

export type ClientBridgeApiGetItems = (query?: ItemQueryParameters) => Result<ItemInstanceDto[], undefined>;

@Controller({})
export class ProtectedPlatformInventoryController {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<ServerBridgeApiGetItems>(
			PlatformInventoryServiceBridgeTopics.GetItems,
			(_, userId, query) => {
				const res = InternalHttpManager.GetAsync(
					`${AirshipUrl.ContentService}/items/self?=${PlatformInventoryUtil.BuildItemQueryString({
						...query,
						resourceIds: [Game.organizationId, Game.gameId].filter(
							(id) => !query?.resourceIds || query.resourceIds.includes(id),
						),
					} as ItemQueryParameters)}`,
				);

				if (!res.success || res.statusCode > 299) {
					warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.error);
					return {
						success: false,
						data: undefined,
					};
				}

				return {
					success: true,
					data: DecodeJSON(res.data),
				};
			},
		);
	}

	protected OnStart(): void {}
}
