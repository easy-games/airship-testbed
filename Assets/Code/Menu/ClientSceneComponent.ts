import { SceneManager } from "@Easy/Core/Shared/SceneManager";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class ClientSceneComponent extends AirshipBehaviour {
	public closeButton!: Button;

	override Start(): void {
		CanvasAPI.OnClickEvent(this.closeButton.gameObject, () => {
			SceneManager.UnloadOfflineScene("ClientSidedScene");
		});
	}

	override OnDestroy(): void {}
}
