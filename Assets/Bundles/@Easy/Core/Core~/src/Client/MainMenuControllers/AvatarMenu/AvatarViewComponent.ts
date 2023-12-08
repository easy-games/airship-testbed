import {} from "@easy-games/flamework-core";
import { CoreUI } from "Shared/UI/CoreUI";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
export default class AvatarViewComponent extends AirshipBehaviour {
	public builder?: AccessoryBuilder;
	public avatarDragBtn?: Button;

	public override OnStart(): void {
		if (this.avatarDragBtn) {
			CoreUI.SetupButton(this.avatarDragBtn.gameObject, { noHoverSound: true });
			CanvasAPI.OnDragEvent(this.avatarDragBtn.gameObject, () => {
				this.OnDragAvatar();
			});
		}
	}

	public ShowAvatar() {
		this.gameObject.SetActive(true);
	}

	public HideAvatar() {
		this.gameObject.SetActive(false);
	}

	public FocusSlot(slotType: AccessorySlot) {
		//TODO move the camera to this position
	}

	public OnDragAvatar() {
		//TODO rotate the avatar with mouse movement
	}
}
