import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";

@Controller({})
export class MainMenuRichPresenceController implements OnStart {
	OnStart(): void {
		SteamLuauAPI.SetRichPresenceTag("#Status_AtMainMenu");
	}
}
