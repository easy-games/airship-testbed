import { Protected } from "@Easy/Core/Shared/Protected";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class SettingsLogoutButton extends AirshipBehaviour {
	private bin = new Bin();

	override Start(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				Protected.User.Logout();
			}),
		);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
