import {} from "@easy-games/flamework-core";
import { Mouse } from "Shared/UserInput";

export default class AvatarViewComponent extends AirshipBehaviour {
	public HumanEntityGo?: GameObject;
	public AvatarHolder?: Transform;
	public CameraTransform?: Transform;

	public CameraWaypointDefault?: Transform;
	public CameraWaypointHead?: Transform;
	public CameraWaypointFeet?: Transform;
	public CameraWaypointHands?: Transform;
	public CameraWaypointBack?: Transform;

	public DragSpeedMod = 10;
	public CameraTransitionDuration = 1;
	public Dragging = false;

	public AccessoryBuilder?: AccessoryBuilder;

	private targetTransform?: Transform;
	private mouse?: Mouse;
	private lastMousePos: Vector3 = Vector3.zero;

	public override OnStart(): void {
		this.AccessoryBuilder = this.HumanEntityGo?.GetComponent<AccessoryBuilder>();
		this.Dragging = false;
		this.mouse = new Mouse();
		this.mouse.Moved.Connect((pos: Vector3) => {
			if (this.Dragging) {
				let diff = pos.sub(this.lastMousePos);
				this.AvatarHolder?.Rotate(0, diff.x * -this.DragSpeedMod, 0);
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
		this.targetTransform = this.CameraWaypointDefault;
		if (
			slotType === AccessorySlot.Head ||
			slotType === AccessorySlot.Face ||
			slotType === AccessorySlot.Hair ||
			slotType === AccessorySlot.Neck ||
			slotType === AccessorySlot.Ears
		) {
			this.targetTransform = this.CameraWaypointHead;
		} else if (
			slotType === AccessorySlot.Feet ||
			slotType === AccessorySlot.Waist ||
			slotType === AccessorySlot.Legs
		) {
			this.targetTransform = this.CameraWaypointFeet;
		} else if (
			slotType === AccessorySlot.Hands ||
			slotType === AccessorySlot.LeftHand ||
			slotType === AccessorySlot.RightHand ||
			slotType === AccessorySlot.Torso
		) {
			this.targetTransform = this.CameraWaypointHands;
		} else if (slotType === AccessorySlot.Backpack) {
			this.targetTransform = this.CameraWaypointBack;
		}
		if (this.CameraTransform && this.targetTransform) {
			this.CameraTransform.TweenPosition(
				this.targetTransform.position,
				this.CameraTransitionDuration,
			).SetEaseQuadInOut();
			this.CameraTransform.TweenRotation(
				this.targetTransform.rotation.eulerAngles,
				this.CameraTransitionDuration,
			).SetEaseQuadInOut();
		}
	}
}
