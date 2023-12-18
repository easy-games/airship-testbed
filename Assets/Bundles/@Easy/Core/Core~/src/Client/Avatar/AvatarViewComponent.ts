import {} from "@easy-games/flamework-core";

export default class AvatarViewComponent extends AirshipBehaviour {
	public humanEntityGo?: GameObject;
	public avatarDragBtn?: GameObject;

	public cameraWaypointDefault?: Transform;
	public cameraWaypointHead?: Transform;
	public cameraWaypointFeet?: Transform;

	public dragSpeedMod = 10;
	public cameraLerpMod = 10;

	public accessoryBuilder?: AccessoryBuilder;

	private targetTransform?: Transform;

	public override OnStart(): void {
		this.accessoryBuilder = this.humanEntityGo?.GetComponent<AccessoryBuilder>();
	}

	override OnUpdate(dt: number): void {}

	public ShowAvatar() {
		this.gameObject.SetActive(true);
	}

	public HideAvatar() {
		this.gameObject.SetActive(false);
	}

	public FocusSlot(slotType: AccessorySlot) {
		this.targetTransform = this.cameraWaypointDefault;
		if (
			slotType === AccessorySlot.Head ||
			slotType === AccessorySlot.Face ||
			slotType === AccessorySlot.Hair ||
			slotType === AccessorySlot.Neck
		) {
			this.targetTransform = this.cameraWaypointHead;
		} else if (
			slotType === AccessorySlot.Feet ||
			slotType === AccessorySlot.Waist ||
			slotType === AccessorySlot.Legs
		) {
			this.targetTransform = this.cameraWaypointFeet;
		}
	}

	public DragView(mouseDelta: Vector2) {
		//TODO rotate the avatar with mouse movement
		this.humanEntityGo?.transform.Rotate(mouseDelta.x * this.dragSpeedMod, 0, 0);
	}
}
