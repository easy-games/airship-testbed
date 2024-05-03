import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class DevConsoleButton extends AirshipBehaviour {
	private bin = new Bin();

	override OnEnable(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				Bridge.OpenDevConsole();
			}),
		);
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
