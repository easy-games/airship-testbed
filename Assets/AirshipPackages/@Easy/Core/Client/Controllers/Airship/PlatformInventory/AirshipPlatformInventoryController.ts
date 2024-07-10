import {
	ClientBridgeApiGetItems,
	PlatformInventoryControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/PlatformInventory/PlatformInventoryController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { ItemQueryParameters } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipPlatformInventory";
import { AirshipUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

/**
 * This controller allows access to the current players platform inventory. Platform inventory
 * is managed by game servers and configured on the https://create.airship.gg website.
 */
@Controller({})
export class AirshipPlatformInventoryController {
	constructor() {
		if (!Game.IsClient()) return;

		Platform.Client.Inventory = this;
	}

	protected OnStart(): void {}

	/**
	 * Gets the items in the users inventory that belong to this game or organization.
	 * @param query Additional filter parameters for retrieving a subset of items.
	 * @returns
	 */
	public async GetItems(query?: ItemQueryParameters) {
		return await AirshipUtil.PromisifyBridgeInvoke<ClientBridgeApiGetItems>(
			PlatformInventoryControllerBridgeTopics.GetItems,
			LuauContext.Protected,
			query,
		);
	}
}
