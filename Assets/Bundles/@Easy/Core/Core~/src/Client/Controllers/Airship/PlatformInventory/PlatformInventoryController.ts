import {
	BridgeApiGetEquippedOutfitByUserId,
	PlatformInventoryControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/PlatformInventory/PlatformInventoryController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { OutfitDto } from "@Easy/Core/Shared/Airship/Types/Outputs/PlatformInventory";
import { AirshipUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";

@Controller({})
export class PlatformInventoryController implements OnStart {
	constructor() {
		if (!Game.IsClient()) return;

		Platform.client.inventory = this;
	}

	OnStart(): void {}

	/**
	 * Gets the users currently equipped outfit.
	 */
	public async GetEquippedOutfitByUserId(userId: string): Promise<Result<OutfitDto | undefined, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<BridgeApiGetEquippedOutfitByUserId>(
			PlatformInventoryControllerBridgeTopics.GetEquippedOutfitByUserId,
			userId,
		);
	}
}
