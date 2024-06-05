import {
	ClientBridgeApiGetItems,
	PlatformInventoryControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/PlatformInventory/PlatformInventoryController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { ItemQueryParameters } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipPlatformInventory";
import { AirshipUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

@Controller({})
export class PlatformInventoryController implements OnStart {
	constructor() {
		if (!Game.IsClient()) return;

		Platform.client.inventory = this;
	}

	OnStart(): void {}

	/**
	 * Gets the items in the users inventory that belong to this game or organization.
	 * @param query Additional filter parameters for retrieving a subset of items.
	 * @returns
	 */
	public async GetItems(query?: ItemQueryParameters) {
		return await AirshipUtil.PromisifyBridgeInvoke<ClientBridgeApiGetItems>(
			PlatformInventoryControllerBridgeTopics.GetItems,
			query,
		);
	}
}
