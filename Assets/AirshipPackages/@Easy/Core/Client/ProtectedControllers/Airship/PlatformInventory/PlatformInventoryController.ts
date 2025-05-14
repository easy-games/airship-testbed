import { AirshipItem, AirshipItemQueryParameters } from "@Easy/Core/Shared/Airship/Types/AirshipPlatformInventory";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { ContentServiceClient } from "@Easy/Core/Shared/TypePackages/content-service-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum PlatformInventoryControllerBridgeTopics {
	GetItems = "PartyControllerGetInventory",
}

export type ClientBridgeApiGetItems = (query?: AirshipItemQueryParameters) => AirshipItem[];

const client = new ContentServiceClient(UnityMakeRequest(AirshipUrl.ContentService));

@Controller({})
export class ProtectedPlatformInventoryController {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<ClientBridgeApiGetItems>(
			PlatformInventoryControllerBridgeTopics.GetItems,
			(_, query) => {
				return this.GetItems(query).expect();
			},
		);
	}

	public async GetItems(query?: AirshipItemQueryParameters): Promise<ReturnType<ClientBridgeApiGetItems>> {
		return await client.items.getUserInventory({
			queryType: query?.queryType,
			query: query?.queryType === "tag" ? query?.tags : query?.classIds,
			resourceIds: [Game.organizationId, Game.gameId].filter(
				(id) => !query?.resourceIds || query.resourceIds.includes(id),
			),
		});
	}

	protected OnStart(): void { }
}
