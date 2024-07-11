import { MainMenuController } from "@Easy/Core/Client/ProtectedControllers/MainMenuController";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { Dependency } from "../../Flamework";

export default class SocialFriendRequestsButtonComponent extends AirshipBehaviour {
	public text!: TMP_Text;
	public button!: Button;

	override Start(): void {
		CanvasAPI.OnClickEvent(this.button.gameObject, () => {
			const go = Object.Instantiate(
				AssetBridge.Instance.LoadAsset(
					"AirshipPackages/@Easy/Core/Prefabs/UI/MainMenu/FriendRequests/FriendRequestsModal.prefab",
				),
				Dependency<MainMenuController>().mainContentCanvas.transform,
			);
			AppManager.OpenModal(go, {
				sortingOrderOffset: 100,
			});
		});
	}

	override OnDestroy(): void {}
}
