import { Airship } from "@Easy/Core/Shared/Airship";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class ClientSceneComponent extends AirshipBehaviour {
	public closeButton!: Button;

	override Start(): void {
		CanvasAPI.OnClickEvent(this.closeButton.gameObject, () => {
			Airship.sceneManager.UnloadClientSidedScene("ClientSidedScene");
		});
	}

	override OnDestroy(): void {}
}
