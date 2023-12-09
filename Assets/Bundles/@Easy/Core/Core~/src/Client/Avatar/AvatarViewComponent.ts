import {} from "@easy-games/flamework-core";
import { CoreUI } from "Shared/UI/CoreUI";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
export default class AvatarViewComponent extends AirshipBehaviour {
	public humanEntityGo?: GameObject;
	public avatarDragBtn?: GameObject;
	public dragSpeedMod = 10;

	public accessoryBuilder?: AccessoryBuilder;

	public override OnStart(): void {
		this.accessoryBuilder = this.humanEntityGo?.GetComponent<AccessoryBuilder>();
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

	public DragView(mouseDelta: Vector2) {
		//TODO rotate the avatar with mouse movement
		this.humanEntityGo?.transform.Rotate(mouseDelta.x * this.dragSpeedMod, 0, 0);
	}
}
