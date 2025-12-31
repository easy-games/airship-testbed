import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { Asset } from "../../Asset";

export default class SocialFriendRequestsButtonComponent extends AirshipBehaviour {
	public text!: TMP_Text;
	public button!: Button;

	override Start(): void {
		CanvasAPI.OnClickEvent(this.button.gameObject, () => {
			VibrationManager.Play(VibrationFeedbackType.Heavy);
			AppManager.OpenModal(
				Asset.LoadAsset(
					"AirshipPackages/@Easy/Core/Prefabs/UI/MainMenu/FriendRequests/FriendRequestsModal.prefab",
				),
			);
		});
	}

	override OnDestroy(): void {}
}
