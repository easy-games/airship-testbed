import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

@Controller({})
export default class ScreenController {
    protected OnStart(): void {
        // Disable screen sleep while in game
        Screen.sleepTimeout = Game.IsInGame() ? SleepTimeout.NeverSleep : SleepTimeout.SystemSetting;
	}
}
