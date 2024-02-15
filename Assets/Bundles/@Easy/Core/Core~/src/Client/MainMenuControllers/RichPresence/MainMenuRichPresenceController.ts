import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";

@Controller({})
export class MainMenuRichPresenceController implements OnStart {
	OnStart(): void {
		SteamLuauAPI.SetRichPresence("steam_display", "#Status_AtMainMenu");
	}
}
