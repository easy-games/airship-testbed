import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class SettingsCloseButton extends AirshipBehaviour {
	private bin = new Bin();

	override Start(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				AppManager.Close();
			}),
		);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
