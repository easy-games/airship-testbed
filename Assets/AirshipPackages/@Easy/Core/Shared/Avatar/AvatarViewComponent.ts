import AvatarRenderComponent from "@Easy/Core/Client/ProtectedControllers//AvatarMenu/AvatarRenderComponent";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { Game } from "../Game";
import { MainMenuSingleton } from "../MainMenu/Singletons/MainMenuSingleton";
import { Bin } from "../Util/Bin";
import { CanvasAPI } from "../Util/CanvasAPI";
import { ColorUtil } from "../Util/ColorUtil";
import { OnUpdate } from "../Util/Timer";
import AvatarBackdropComponent from "./AvatarBackdropComponent";

export default class AvatarViewComponent extends AirshipBehaviour {
	@Header("Templates")
	public avatarRenderTemplate?: GameObject;

	@Header("References")
	public humanEntityGo?: GameObject;
	public avatarHolder?: Transform;
	public anim!: Animator;
	public accessoryBuilder?: AccessoryBuilder;
	public cameraRigTransform?: Transform;
	public avatarCamera?: Camera;
	public backdropHolder?: GameObject;

	public cameraWaypointDefault?: Transform;
	public cameraWaypointHead?: Transform;
	public cameraWaypointFeet?: Transform;
	public cameraWaypointHands?: Transform;
	public cameraWaypointBack?: Transform;
	public cameraWaypointCenterHero?: Transform;
	public cameraWaypointBirdsEye?: Transform;

	@Header("Variables")
	public dragSpeedMod = 10;
	public freeSpinDrag = 3;
	public cameraTransitionDuration = 1;
	public screenspaceDistance = 3;

	public alignmentOffsetWorldpsace = new Vector3(0, 0, 0);
	public oddsOfAReaction = 0.25;

	@Header("Spin Big")
	public spinBigRequiredTime = 3;
	public spinBigRequiredSpeed = 10;

	@NonSerialized()
	public dragging = false;

	private targetTransform?: Transform;
	private mouse?: Mouse;
	private lastMousePos: Vector2 = Vector2.zero;
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

	private mainMenuSingleton: MainMenuSingleton;

	private bin = new Bin();

	public override Awake(): void {
		this.dragging = false;
		if (Game.IsPortrait()) {
			this.alignmentOffsetWorldpsace = new Vector3(0, 1.1, 0);
		}
	}

	public override Start(): void {
		this.mainMenuSingleton = Dependency<MainMenuSingleton>();
		let backdrop = this.backdropHolder?.GetAirshipComponent<AvatarBackdropComponent>();
		backdrop?.SetSolidColorBackdrop(ColorUtil.HexToColor("#202122"));

		if (this.humanEntityGo) {
			this.accessoryBuilder = this.humanEntityGo.GetComponent<AccessoryBuilder>()!;
		}

		Mouse.onMoved.Connect((pos: Vector2) => {
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

		//Make sure no lights effect this scene
		// let lights = GameObject.FindObjectsByType<Light>(FindObjectsInactive.Include, FindObjectsSortMode.None);
		// if(!lights){
		// 	error("Unable to find lights in scene");
		// }
		// for(let i=0; i<lights.Length; i++){
		// 	let light = lights.GetValue(i);
		// 	if(light){
		// 		light.cullingMask &= ~(1 << Layer.AVATAR_EDITOR);
		// 	}
		// }
	}

	private UpdateSpinAnimation() {
		//print("spinVel: " + this.spinVel);
		const speed = math.abs(this.spinVel);
		if (this.spinningBig) {
			if (speed < this.spinBigRequiredSpeed) {
				//Stop spinning big
				this.spinningBig = false;
				this.spinBigStartTime = 0;
				this.spinAnimationTriggered = false;
				this.anim.SetBool("Spinning", false);
			} else if (!this.spinAnimationTriggered) {
				if (Time.time - this.spinBigStartTime > this.spinBigRequiredTime) {
					//We will stumble at the end
					this.spinAnimationTriggered = true;
					this.anim.SetBool("Dizzy", true);
				}
			}
		} else if (speed > this.spinBigRequiredSpeed) {
			//Start spinning big
			this.spinningBig = true;
			this.spinBigStartTime = Time.time;
			this.anim.SetBool("Spinning", true);
			this.anim.SetBool("Dizzy", false);
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
		this.renderTexture = RenderUtils.CreateDefaultRenderTexture(width, height);
		this.avatarCamera.targetTexture = this.renderTexture;
		this.avatarCamera.enabled = true;
		this.mainMenuSingleton.avatarEditorRenderTexture = this.renderTexture;
		this.mainMenuSingleton.onAvatarEditorRenderTextureUpdated.Fire(this.renderTexture);
	}

	public ShowAvatar() {
		this.gameObject.SetActive(true);
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

		//print("Aligning to: " + screenPos + " offset: " + this.alignmentOffsetWorldpsace);
		this.cameraRigTransform.localPosition = Vector3.zero;
		if (this.cameraWaypointDefault) {
			this.avatarCamera.transform.position = this.cameraWaypointDefault.position;
			this.avatarCamera.transform.rotation = this.cameraWaypointDefault.rotation;
		}
		let worldspace = this.avatarCamera.ScreenToWorldPoint(
			new Vector3(screenPos.x, screenPos.y, this.screenspaceDistance),
		);
		//print("worldspace align: " + worldspace);
		let diff = this.cameraRigTransform.position.sub(worldspace);
		this.cameraRigTransform.position = this.cameraRigTransform.position
			.add(new Vector3(diff.x, diff.y, 0))
			.add(this.alignmentOffsetWorldpsace);
		this.CameraFocusTransform(this.targetTransform, true);
	}

	public CameraFocusSlot(slotType: AccessorySlot) {
		this.targetTransform = this.GetFocusTransform(slotType);
		this.CameraFocusTransform(this.targetTransform);
	}

	public GetFocusTransform(slotType: AccessorySlot) {
		// if (
		// 	slotType === AccessorySlot.Head ||
		// 	slotType === AccessorySlot.Hair ||
		// 	slotType === AccessorySlot.Neck ||
		// 	slotType === AccessorySlot.Ears ||
		// 	slotType === AccessorySlot.Nose
		// ) {
		// 	return this.cameraWaypointHead;
		// } else if (
		// 	slotType === AccessorySlot.Feet ||
		// 	slotType === AccessorySlot.Waist ||
		// 	slotType === AccessorySlot.Legs ||
		// 	slotType === AccessorySlot.LegsInner ||
		// 	slotType === AccessorySlot.LegsOuter ||
		// 	slotType === AccessorySlot.LeftFoot ||
		// 	slotType === AccessorySlot.RightFoot ||
		// 	slotType === AccessorySlot.FeetInner
		// ) {
		// 	return this.cameraWaypointFeet;
		// } else if (
		// 	slotType === AccessorySlot.Hands ||
		// 	slotType === AccessorySlot.LeftHand ||
		// 	slotType === AccessorySlot.RightHand ||
		// 	slotType === AccessorySlot.Torso ||
		// 	slotType === AccessorySlot.HandsOuter
		// ) {
		// 	//return this.cameraWaypointHands;
		// }
		if (slotType === AccessorySlot.Backpack) {
			return this.cameraWaypointBack;
		}
		return this.cameraWaypointDefault;
	}

	public CameraFocusTransform(transform?: Transform, instant = false) {
		this.targetTransform = transform;
		if (this.avatarCamera?.transform && this.targetTransform) {
			if (instant) {
				this.avatarCamera.transform.position = this.targetTransform.position;
				this.avatarCamera.transform.rotation = this.targetTransform.rotation;
			} else {
				NativeTween.Position(
					this.avatarCamera.transform,
					this.targetTransform.position,
					this.cameraTransitionDuration,
				)
					.SetEaseQuadInOut()
					.SetUseUnscaledTime(true);
				NativeTween.Rotation(
					this.avatarCamera.transform,
					this.targetTransform.rotation.eulerAngles,
					this.cameraTransitionDuration,
				)
					.SetEaseQuadInOut()
					.SetUseUnscaledTime(true);
			}
		}
	}

	public CreateRenderScene() {
		return Object.Instantiate(
			this.avatarRenderTemplate,
			this.transform,
		)?.GetAirshipComponent<AvatarRenderComponent>();
	}

	public PlayReaction(slotType: AccessorySlot) {
		if (math.random() < this.oddsOfAReaction) {
			this.anim.SetInteger("ReactionIndex", math.random(3) - 1);
			this.anim.SetTrigger("React");
		}
	}
}
