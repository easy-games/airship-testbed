import { Platform } from "@Easy/Core/Shared/Airship";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

@Controller({})
export class PlatformInventoryController implements OnStart {
	constructor() {
		if (!Game.IsClient()) return;

		Platform.client.inventory = this;
	}

	OnStart(): void {}

	// TODO: Add methods for client to get its owned inventory for the current game + organization.

	// TODO: Like on the server, I don't know if this makes sense to expose or if it should exist here.
	// /**
	//  * Gets the users currently equipped outfit.
	//  */
	// public async GetEquippedOutfitByUserId(userId: string): Promise<Result<OutfitDto | undefined, undefined>> {
	// 	return await AirshipUtil.PromisifyBridgeInvoke<BridgeApiGetEquippedOutfitByUserId>(
	// 		PlatformInventoryControllerBridgeTopics.GetEquippedOutfitByUserId,
	// 		userId,
	// 	);
	// }
}
