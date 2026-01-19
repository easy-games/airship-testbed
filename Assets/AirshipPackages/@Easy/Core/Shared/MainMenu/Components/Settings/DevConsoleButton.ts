import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class DevConsoleButton extends AirshipBehaviour {
	private bin = new Bin();

	override OnEnable(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				if (Game.IsMobile() && Game.IsPortrait()) return;
				Bridge.OpenDevConsole();
			}),
		);
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
