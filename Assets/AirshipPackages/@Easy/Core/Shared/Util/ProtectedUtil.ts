import { Dependency } from "../Flamework";
import { Game } from "../Game";
import { MainMenuSingleton } from "../MainMenu/Singletons/MainMenuSingleton";

/**
 * Utility functions for internal Airship use only. Nothing here is supported!
 * @internal
 */
export class ProtectedUtil {
	public static IsPhoneMode(): boolean {
		return Game.IsMobile() && Dependency<MainMenuSingleton>().sizeType === "sm";
	}

	public static GetNotchHeight(): number {
		if (Game.IsPortrait()) {
			let notchHeight = Screen.safeArea.y / 2;
			return notchHeight;
		}
		return (Screen.width - Screen.safeArea.xMax) / 2;
	}
}
