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
			notchHeight = safeArea.y / 2;

			// For some reason Android does it from bottom-left, instead of top-left like iOS... don't ask me why
			// this hasn't been made consistent by Unity...
			if (Game.platform === AirshipPlatform.Android) {
				notchHeight = (Screen.height - (Screen.safeArea.y + Screen.safeArea.height)) / 2;
			}
		} else {
			notchHeight = Screen.height - safeArea.yMax;
		}
		// print(`notch height: ${notchHeight}`);
		return notchHeight;
	}

	public static GetLocalPlatformString(): string {
		const platform = Game.platform;
		switch (platform) {
			case AirshipPlatform.iOS:
				return "iOS";
			case AirshipPlatform.Android:
				return "Android";
			case AirshipPlatform.Windows:
				return "Windows";
			case AirshipPlatform.Mac:
				return "Mac";
			case AirshipPlatform.Linux:
				return "Linux";
		}
	}
}
