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
}
