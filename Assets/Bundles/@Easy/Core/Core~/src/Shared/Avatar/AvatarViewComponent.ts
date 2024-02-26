import {} from "Shared/Flamework";
import { Mouse } from "Shared/UserInput";
import { Bin } from "../Util/Bin";
import { CanvasAPI } from "../Util/CanvasAPI";
import { OnUpdate } from "../Util/Timer";

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
	public freeSpinDrag = 3;
	public cameraTransitionDuration = 1;
	public screenspaceDistance = 3;
	public dragging = false;
	public alignmentOffsetWorldpsace = new Vector3(0, 0, 0);

	public accessoryBuilder?: AccessoryBuilder;
	public anim?: CharacterAnimationHelper;

	@Header("Spin Big")
	public idleAnim!: AnimationClip;
	public spinAnimLoop!: AnimationClip;
	public spinAnimStop!: AnimationClip;
	public spinBigRequiredTime = 3;
	public spinBigRequiredSpeed = 10;

	private targetTransform?: Transform;
	private mouse?: Mouse;
	private lastMousePos: Vector3 = Vector3.zero;
	private initialized = false;
	private spinVel = 0;

	private renderTexture?: RenderTexture;

	private lastScreenRefreshTime = 0;
	private screenRefreshCooldown = 0.5;
	private screenSizeIsDirty = false;
	private spinBigStartTime = 0;
	private spinningBig = false;
	private spinAnimationTriggered = false;
	private freeSpinning = false;

	private bin = new Bin();

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
				let vel = diff.x * -this.dragSpeedMod;
				this.avatarHolder?.Rotate(0, vel, 0);
				this.spinVel = vel;
				this.UpdateSpinAnimation();
			}
			this.lastMousePos = pos;
		});
		this.initialized = true;

		this.CreateRenderTexture(Screen.width, Screen.height);
		CanvasAPI.OnScreenSizeEvent((width, height) => {
			this.lastScreenRefreshTime = Time.time;
			this.screenSizeIsDirty = true;
		});
	}

	public OnEnable(): void {
		this.bin.Add(
			OnUpdate.Connect((dt) => {
				//FREE SPINNING
				if (!this.dragging && math.abs(this.spinVel) > 0.01) {
					this.freeSpinning = true;
					this.spinVel = this.spinVel * (1 - dt * this.freeSpinDrag);
					// this.spinVel -= (this.spinVel / this.freeSpinDrag) * dt;
					this.avatarHolder?.Rotate(0, this.spinVel, 0);
					this.UpdateSpinAnimation();
				} else if (this.freeSpinning) {
					this.freeSpinning = false;
				}
			}),
		);
	}

	private UpdateSpinAnimation() {
		//print("spinVel: " + this.spinVel);
		const speed = math.abs(this.spinVel);
		if (this.spinningBig) {
			if (speed < this.spinBigRequiredSpeed) {
				//Stop spinning big
				this.spinningBig = false;
				this.spinBigStartTime = 0;

				if (this.spinAnimationTriggered) {
					//Stumble animation
					this.spinAnimationTriggered = false;
					let options = new AnimationClipOptions();
					options.fadeOutToClip = this.idleAnim;
					this.anim?.Play(this.spinAnimStop, 0, options);
				} else {
					//Go to idle
					let options = new AnimationClipOptions();
					options.autoFadeOut = false;
					this.anim?.Play(this.idleAnim, 0, options);
				}
			} else if (!this.spinAnimationTriggered) {
				if (Time.time - this.spinBigStartTime > this.spinBigRequiredTime) {
					//We will stumble at the end
					this.spinAnimationTriggered = true;
				}
			}
		} else if (speed > this.spinBigRequiredSpeed) {
			//Start spinning big
			this.spinningBig = true;
			this.spinBigStartTime = Time.time;
			this.anim?.PlayOneShot(this.spinAnimLoop, 0);
		}
	}

	public OnDisable(): void {
		this.bin.Clean();
	}

	override FixedUpdate(dt: number): void {
		if (this.screenSizeIsDirty && Time.time - this.lastScreenRefreshTime > this.screenRefreshCooldown) {
			this.screenSizeIsDirty = false;
			this.CreateRenderTexture(Screen.width, Screen.height);
		}
	}

	private CreateRenderTexture(width: number, height: number) {
		if (!this.avatarCamera) {
			return;
		}
		print("Creating new Avatar Render Texture: " + width + ", " + height);
		this.renderTexture = new RenderTexture(width, height, 24, RenderTextureFormat.ARGB32);
		this.avatarCamera.targetTexture = this.renderTexture;
		this.avatarCamera.enabled = true;
		for (let i = 0; i < this.onNewRenderTexture.size(); i++) {
			this.onNewRenderTexture[i](this.renderTexture);
		}
	}

	private onNewRenderTexture: ((texture: RenderTexture) => void)[] = [];
	public OnNewRenderTexture(callback: (texture: RenderTexture) => void) {
		this.onNewRenderTexture.push(callback);
		if (this.renderTexture) {
			callback(this.renderTexture);
		}
	}

	public ShowAvatar() {
		this.gameObject.SetActive(true);
		//this.anim?.SetState(CharacterState.Idle, true);
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
		this.cameraRigTransform.position = this.cameraRigTransform.position
			.add(new Vector3(diff.x, diff.y, 0))
			.add(this.alignmentOffsetWorldpsace);
		this.CameraFocusTransform(this.targetTransform, true);
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
