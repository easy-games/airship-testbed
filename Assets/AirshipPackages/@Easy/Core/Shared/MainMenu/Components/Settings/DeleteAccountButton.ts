import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class DeleteAccountButton extends AirshipBehaviour {
	private bin = new Bin();

	override OnEnable(): void {
		CanvasAPI.OnClickEvent(this.gameObject, () => {
			task.spawn(() => {
				const res = InternalHttpManager.DeleteAsync(AirshipUrl.GameCoordinator + "/users/self");
				if (res.error) {
					error(res.error);
				}
				AuthManager.ClearSavedAccount();
				Bridge.LoadScene("Login", true, LoadSceneMode.Single);
			});
		});
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
