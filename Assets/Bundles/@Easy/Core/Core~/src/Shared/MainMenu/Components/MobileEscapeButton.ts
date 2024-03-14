import { MainMenuController } from "@Easy/Core/Client/MainMenuControllers/MainMenuController";
import { Dependency } from "../../Flamework";
import { Bin } from "../../Util/Bin";
import { CanvasAPI } from "../../Util/CanvasAPI";

export default class MobileEscapeButton extends AirshipBehaviour {
	private bin = new Bin();

	override OnEnable(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				const mainMenuController = Dependency<MainMenuController>();
				if (mainMenuController.IsOpen()) {
					mainMenuController.CloseFromGame();
				} else {
					mainMenuController.OpenFromGame();
				}
			}),
		);
	}

	override OnDisable(): void {}
}
