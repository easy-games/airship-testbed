import { MainMenuController } from "@Easy/Core/Client/ProtectedControllers/MainMenuController";
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
				} else {
					mainMenuController.OpenFromGameInProtectedContext();
				}
			}),
		);
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
