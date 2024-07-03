import { Controller } from "@Easy/Core/Shared/Flamework";

@Controller({})
export class MainMenuRichPresenceController {
	protected OnStart(): void {
		SteamLuauAPI.SetRichPresence("steam_display", "#Status_AtMainMenu");
	}
}
