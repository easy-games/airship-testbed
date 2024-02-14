import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";

@Controller({})
export class MainMenuRichPresenceController implements OnStart {
	OnStart(): void {
		const set = SteamLuauAPI.SetRichPresence("steam_display", "#Status_AtMainMenu");
		print("Set main menu rich presence: " + set);
	}
}
