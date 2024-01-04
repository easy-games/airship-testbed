import {} from "@easy-games/flamework-core";
import { Mouse } from "Shared/UserInput";

export default class AvatarViewComponent extends AirshipBehaviour {
	public humanEntityGo?: GameObject;
	public avatarHolder?: Transform;
	public cameraTransform?: Transform;

	public cameraWaypointDefault?: Transform;
	public cameraWaypointHead?: Transform;
	public cameraWaypointFeet?: Transform;
	public cameraWaypointHands?: Transform;
	public cameraWaypointBack?: Transform;

	public dragSpeedMod = 10;
	public cameraTransitionDuration = 1;
	public dragging = false;

	public accessoryBuilder?: AccessoryBuilder;

	private targetTransform?: Transform;
	private mouse?: Mouse;
	private lastMousePos: Vector3 = Vector3.zero;

	public override Start(): void {
		this.accessoryBuilder = this.humanEntityGo?.GetComponent<AccessoryBuilder>();
		this.dragging = false;
		this.mouse = new Mouse();
		this.mouse.moved.Connect((pos: Vector3) => {
			if (this.dragging) {
				let diff = pos.sub(this.lastMousePos);
				this.avatarHolder?.Rotate(0, diff.x * -this.dragSpeedMod, 0);
			}
			this.lastMousePos = pos;
		});
	}

	public ShowAvatar() {
		this.gameObject.SetActive(true);
	}

	public HideAvatar() {
		this.gameObject.SetActive(false);
	}

	public FocusSlot(slotType: AccessorySlot) {
		print("Fosuing slot: " + slotType);
		this.targetTransform = this.cameraWaypointDefault;
		if (
			slotType === AccessorySlot.Head ||
			slotType === AccessorySlot.Face ||
			slotType === AccessorySlot.Hair ||
			slotType === AccessorySlot.Neck ||
			slotType === AccessorySlot.Ears
		) {
			this.targetTransform = this.cameraWaypointHead;
		} else if (
			slotType === AccessorySlot.Feet ||
			slotType === AccessorySlot.Waist ||
			slotType === AccessorySlot.Legs
		) {
			this.targetTransform = this.cameraWaypointFeet;
		} else if (
			slotType === AccessorySlot.Hands ||
			slotType === AccessorySlot.LeftHand ||
			slotType === AccessorySlot.RightHand ||
			slotType === AccessorySlot.Torso
		) {
			this.targetTransform = this.cameraWaypointHands;
		} else if (slotType === AccessorySlot.Backpack) {
			this.targetTransform = this.cameraWaypointBack;
		}
		if (this.cameraTransform && this.targetTransform) {
			this.cameraTransform
				.TweenPosition(this.targetTransform.position, this.cameraTransitionDuration)
				.SetEaseQuadInOut();
			this.cameraTransform
				.TweenRotation(this.targetTransform.rotation.eulerAngles, this.cameraTransitionDuration)
				.SetEaseQuadInOut();
		}
	}
}
