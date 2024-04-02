import { Dependency } from "../Flamework";
import { Game } from "../Game";
import { MainMenuSingleton } from "../MainMenu/Singletons/MainMenuSingleton";
import { Bin } from "../Util/Bin";

export default class MobileOverlayManager extends AirshipBehaviour {
	@Header("References")
	public canvasScalar!: CanvasScaler;

	private bin = new Bin();

	override Start(): void {
		const mainMenu = Dependency<MainMenuSingleton>();
		mainMenu.ObserveScreenSize((st, size) => {
			if (Game.IsMobile()) {
				this.canvasScalar.scaleFactor = Screen.dpi / 180;
			} else if (Screen.dpi >= 255) {
				this.canvasScalar.scaleFactor = 1.75;
			} else {
				this.canvasScalar.scaleFactor = 1;
			}
		});
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
