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
		const safeArea = Screen.safeArea;
		let notchHeight: number;
		// print(`safeArea.min: ${safeArea.min}, safeArea.max: ${safeArea.max}`);
		if (Game.IsPortrait()) {
			notchHeight = safeArea.yMin;
		} else {
			notchHeight = Screen.height - safeArea.yMax;
		}
		// print(`notch height: ${notchHeight}`);
		return notchHeight;
	}
}
