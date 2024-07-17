import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { ControlScheme, Preferred } from "@Easy/Core/Shared/UserInput";
import { Bin } from "../../../Util/Bin";
import { MainMenuSingleton } from "../../Singletons/MainMenuSingleton";

export default class AirshipOverlayManager extends AirshipBehaviour {
	@Header("References")
	public escapeButton!: RectTransform;
	public chatButton!: RectTransform;
	public canvasScalar: CanvasScaler;

	private bin = new Bin();

	override Start(): void {
		const controls = new Preferred();
		this.bin.Add(
			controls.ObserveControlScheme((scheme) => {
				if (scheme === ControlScheme.Touch) {
					this.escapeButton.gameObject.SetActive(true);
					this.chatButton.gameObject.SetActive(true);
				} else {
					this.escapeButton.gameObject.SetActive(false);
					this.chatButton.gameObject.SetActive(false);
				}
			}),
		);

		const mainMenu = Dependency<MainMenuSingleton>();
		mainMenu.ObserveScreenSize((st, size) => {
			if (Game.IsMobile() && st === "sm") {
				this.canvasScalar.scaleFactor = 2.5;
			} else {
				this.canvasScalar.scaleFactor = 1;
			}
		});
		mainMenu.onHideMobileEscapeButtonChanged.Connect((hide) => {
			if (!Game.IsMobile()) return;
			this.escapeButton.gameObject.SetActive(!hide);
		});
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
