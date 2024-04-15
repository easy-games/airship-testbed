import { AppManager } from "Shared/Util/AppManager";
import { CanvasAPI } from "Shared/Util/CanvasAPI";

export default class SocialFriendRequestsButtonComponent extends AirshipBehaviour {
	public text!: TMP_Text;
	public button!: Button;

	override Start(): void {
		CanvasAPI.OnClickEvent(this.button.gameObject, () => {
			const go = Object.Instantiate(
				AssetBridge.Instance.LoadAsset(
					"@Easy/Core/Shared/Resources/Prefabs/UI/MainMenu/FriendRequests/FriendRequestsModal.prefab",
				),
			);
			const canvas = go.GetComponent<Canvas>()!;
			canvas.enabled = false;

			AppManager.Open(canvas, {
				noOpenSound: true,
				addToStack: true,
				sortingOrderOffset: 100,
				onClose: () => {
					Object.Destroy(canvas.gameObject);
				},
			});
		});
	}

	override OnDestroy(): void {}
}
