import { MainMenuController } from "@Easy/Core/Client/MainMenuControllers/MainMenuController";
import { Dependency } from "../../Flamework";
import { Bin } from "../../Util/Bin";
import { CanvasAPI } from "../../Util/CanvasAPI";

export default class MobileEscapeButton extends AirshipBehaviour {
	public chatButton!: GameObject;

	private bin = new Bin();

	override OnEnable(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				const mainMenuController = Dependency<MainMenuController>();
				if (mainMenuController.IsOpen()) {
					mainMenuController.CloseFromGame();
					this.chatButton.SetActive(true);
				} else {
					mainMenuController.OpenFromGame();
					this.chatButton.SetActive(false);
				}
			}),
		);
	}

	override OnDisable(): void {}
}
