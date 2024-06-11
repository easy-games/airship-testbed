import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class SettingsLogoutButton extends AirshipBehaviour {
	private bin = new Bin();

	override Start(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				AuthManager.ClearSavedAccount();
				Bridge.LoadScene("Login", true, LoadSceneMode.Single);
			}),
		);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
