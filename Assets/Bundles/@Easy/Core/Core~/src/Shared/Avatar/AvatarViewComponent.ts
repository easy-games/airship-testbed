import {} from "Shared/Flamework";
import { Mouse } from "Shared/UserInput";
import { Bin } from "../Util/Bin";

export default class AvatarViewComponent extends AirshipBehaviour {
	public humanEntityGo?: GameObject;
	public avatarHolder?: Transform;
	public cameraRigTransform?: Transform;
	public avatarCamera?: Camera;
	public testTransform?: Transform;

	public cameraWaypointDefault?: Transform;
	public cameraWaypointHead?: Transform;
	public cameraWaypointFeet?: Transform;
	public cameraWaypointHands?: Transform;
	public cameraWaypointBack?: Transform;
	public cameraWaypointCenterHero?: Transform;
	public cameraWaypointBirdsEye?: Transform;

	public dragSpeedMod = 10;
	public cameraTransitionDuration = 1;
	public screenspaceDistance = 3;
	public dragging = false;

	public accessoryBuilder?: AccessoryBuilder;
	public anim?: CharacterAnimationHelper;

	private targetTransform?: Transform;
	private mouse?: Mouse;
	private lastMousePos: Vector3 = Vector3.zero;
	private initialized = false;

	public override Start(): void {
		print("AVATAR VIEW START");
		if (this.humanEntityGo) {
			this.accessoryBuilder = this.humanEntityGo.GetComponent<AccessoryBuilder>();
			if (this.accessoryBuilder) {
				this.accessoryBuilder.thirdPersonLayer = this.humanEntityGo.layer;
				this.accessoryBuilder.firstPersonLayer = this.humanEntityGo.layer;
			}
			this.anim = this.humanEntityGo.GetComponent<CharacterAnimationHelper>();
		}
		this.dragging = false;
		this.mouse = new Mouse();
		this.mouse.moved.Connect((pos: Vector3) => {
			if (this.dragging) {
				let diff = pos.sub(this.lastMousePos);
				this.avatarHolder?.Rotate(0, diff.x * -this.dragSpeedMod, 0);
			}
			this.lastMousePos = pos;
		});
		this.initialized = true;
	}

	public ShowAvatar() {
		this.gameObject.SetActive(true);
		this.anim?.SetState(CharacterState.Idle, true);
	}

	public HideAvatar() {
		this.gameObject.SetActive(false);
	}

	public ResetAvatar() {
		if (this.avatarHolder) {
			this.avatarHolder.localEulerAngles = Vector3.zero;
		}
	}

	public AlignCamera(screenPos: Vector3) {
		if (!this.cameraRigTransform || !this.avatarCamera || !this.avatarHolder) {
			return;
		}

		print("Aligning to: " + screenPos);
		this.cameraRigTransform.localPosition = Vector3.zero;
		if (this.cameraWaypointDefault) {
			this.avatarCamera.transform.position = this.cameraWaypointDefault.position;
			this.avatarCamera.transform.rotation = this.cameraWaypointDefault.rotation;
		}
		let worldspace = this.avatarCamera.ScreenToWorldPoint(
			new Vector3(screenPos.x, screenPos.y, this.screenspaceDistance),
		);
		print("worldspace align: " + worldspace);
		if (this.testTransform) {
			this.testTransform.position = worldspace;
		}
		let diff = this.cameraRigTransform.position.sub(worldspace);
		this.cameraRigTransform.position = this.cameraRigTransform.position.add(new Vector3(diff.x, 0, 0));
		this.CameraFocusTransform(this.targetTransform, false);
	}

	public CameraFocusSlot(slotType: AccessorySlot) {
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
		this.CameraFocusTransform(this.targetTransform);
	}

	public CameraFocusTransform(transform?: Transform, instant = false) {
		this.targetTransform = transform;
		if (this.avatarCamera?.transform && this.targetTransform) {
			if (instant) {
				this.avatarCamera.transform.position = this.targetTransform.position;
				this.avatarCamera.transform.rotation = this.targetTransform.rotation;
			} else {
				this.avatarCamera.transform
					.TweenPosition(this.targetTransform.position, this.cameraTransitionDuration)
					.SetEaseQuadInOut();
				this.avatarCamera.transform
					.TweenRotation(this.targetTransform.rotation.eulerAngles, this.cameraTransitionDuration)
					.SetEaseQuadInOut();
			}
		}
	}
}
