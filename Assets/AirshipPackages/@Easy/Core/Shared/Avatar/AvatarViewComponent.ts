import AvatarRenderComponent from "@Easy/Core/Client/ProtectedControllers//AvatarMenu/AvatarRenderComponent";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { Game } from "../Game";
import { MainMenuSingleton } from "../MainMenu/Singletons/MainMenuSingleton";
import { Bin } from "../Util/Bin";
import { CanvasAPI } from "../Util/CanvasAPI";
import { Layer } from "../Util/Layer";
import { OnUpdate } from "../Util/Timer";

export default class AvatarViewComponent extends AirshipBehaviour {
	@Header("Templates")
	public avatarRenderTemplate?: GameObject;

	@Header("References")
	public humanEntityGo?: GameObject;
	public avatarHolder?: Transform;
	public anim!: Animator;
	public accessoryBuilder: AccessoryBuilder;
	public avatarCamera: Camera;
	public backdropHolder?: GameObject;
	public cameraRig: Transform;
	public cameraPivot: Transform;
	public inGameVolume: Volume;
	public mainMenuVolume: Volume;

	@Header("Zoom")
	public startingOffset = 4.4;
	public minOffset = 2;
	public maxOffset = 7;
	public zoomSensitivity = 0.2;
	public zoomLerpSpeed = 1;
	public mobileZoomOffset = 8;
	private goalOffset = this.startingOffset;
	private currentZoomOffset = this.startingOffset;

	@Header("Camera Waypoints")
	public cameraWaypointDefault?: Transform;
	public cameraWaypointHead?: Transform;

	@Header("Variables")
	public dragSpeedMod = 10;
	public freeSpinDrag = 3;
	public cameraTransitionDuration = 1;
	public screenspaceDistance = 3;

	@NonSerialized()
	public minDragSpeed = 0.01;

	public oddsOfAReaction = 0.25;

	@Header("Spin Big")
	public spinBigRequiredTime = 3;
	public spinBigRequiredSpeed = 10;

	@NonSerialized()
	public dragging = false;

	private targetTransform?: Transform;
	private spinVel = 0;

	private renderTexture?: RenderTexture;

	private currentCamAngle = 0;
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
	}

	public override Start(): void {
		this.mainMenuSingleton = Dependency<MainMenuSingleton>();
		// let backdrop = this.backdropHolder?.GetAirshipComponent<AvatarBackdropComponent>();
		// backdrop?.SetSolidColorBackdrop(ColorUtil.HexToColor("#202122"));

		this.CreateRenderTexture(Screen.width, Screen.height);
		CanvasAPI.OnScreenSizeEvent((width, height) => {
			this.lastScreenRefreshTime = Time.time;
			this.screenSizeIsDirty = true;
		});
	}

	protected Update(dt: number): void {
		if (Game.IsMobile()) {
			this.currentZoomOffset = this.mobileZoomOffset;
			// return;
		} else {
			this.currentZoomOffset = math.smoothStep(this.currentZoomOffset, this.goalOffset, dt * this.zoomLerpSpeed);
			this.currentZoomOffset = math.clamp(this.currentZoomOffset, this.minOffset, this.maxOffset);
		}

		// this.currentZoomOffset = this.goalOffset;
		// print("offset: " + this.currentZoomOffset + ", goal: " + this.goalOffset);

		let dir = this.avatarCamera.transform.position.sub(this.cameraPivot.position).normalized;
		this.avatarCamera.transform.position = this.cameraPivot.position.add(dir.mul(this.currentZoomOffset));
		if (Game.IsMobile()) {
			this.avatarCamera.transform.position = this.avatarCamera.transform.position.WithX(0);
		}
		// this.avatarCamera.transform.LookAt(this.cameraPivot.position);
	}

	public OnEnable(): void {
		if (Game.deviceType === AirshipDeviceType.Phone) {
			this.avatarCamera.transform.localPosition = new Vector3(0, -1.21, -8.13);
			this.avatarCamera.transform.localRotation = Quaternion.Euler(6.2, 0, 0);
		}
		this.bin.Add(
			OnUpdate.Connect((dt) => {
				if (this.dragging) {
					const mouseX = Input.GetAxis("Mouse X");
					let vel = mouseX * this.dragSpeedMod * Time.deltaTime;
					this.currentCamAngle += vel;

					if (math.abs(vel) > this.minDragSpeed) {
						this.spinVel = vel;
					} else {
						this.spinVel = 0;
					}
				} else if (!this.dragging && math.abs(this.spinVel) > this.minDragSpeed) {
					this.freeSpinning = true;
					this.spinVel = this.spinVel * (1 - dt * this.freeSpinDrag);
					this.currentCamAngle += this.spinVel;
				} else if (this.freeSpinning) {
					this.freeSpinning = false;
				}

				const rotation = Quaternion.Euler(0, this.currentCamAngle, 0);
				this.cameraRig.rotation = rotation;
			}),
		);

		// Skybox
		if (!Game.IsInGame()) {
			const skyboxMat = Resources.Load("AvatarEditorSkybox") as Material;
			if (skyboxMat !== undefined) {
				task.spawn(() => {
					Bridge.SetSkyboxMaterial(skyboxMat);
				});
			}
		}
		if (Game.IsInGame()) {
			this.inGameVolume.gameObject.SetActive(true);
			this.mainMenuVolume.gameObject.SetActive(false);
		} else {
			this.inGameVolume.gameObject.SetActive(false);
			this.mainMenuVolume.gameObject.SetActive(true);
		}

		this.currentZoomOffset = this.maxOffset;
		this.goalOffset = this.startingOffset;
		this.bin.Connect(Mouse.onScrolled, (event) => {
			const t = new PointerEventData(EventSystem.current);
			t.position = Mouse.position;
			const results = EventSystem.current.RaycastAll(t);
			for (let result of results) {
				if (result.gameObject.GetComponent<ScrollRect>() !== undefined) {
					return;
				}
			}

			this.goalOffset -= event.delta * this.zoomSensitivity;
			this.goalOffset = math.clamp(this.goalOffset, this.minOffset, this.maxOffset);
		});

		//Make sure no lights effect this scene
		let lights = GameObject.FindObjectsByType<Light>(FindObjectsInactive.Include, FindObjectsSortMode.None);
		if (!lights) {
			error("Unable to find lights in scene");
		}
		for (const i of $range(0, lights.size() - 1)) {
			const light = lights[i];
			if (light && light.gameObject.scene.name !== "CoreScene" && light.gameObject.scene.name !== "MainMenu") {
				light.cullingMask &= ~(1 << Layer.AVATAR_EDITOR);
			}
		}
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
		this.renderTexture = Bridge.MakeDefaultRenderTexture(width, height);
		this.renderTexture.antiAliasing = 2;
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

	public CameraFocusSlot(slotType: AccessorySlot) {
		this.targetTransform = this.GetFocusTransform(slotType);
		// this.CameraFocusTransform(this.targetTransform);
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
		// if (slotType === AccessorySlot.Backpack) {
		// 	return this.cameraWaypointBack;
		// }
		return this.cameraWaypointDefault;
	}

	public CreateRenderScene() {
		assert(this.avatarRenderTemplate, "Missing avatar render template");
		return Object.Instantiate(
			this.avatarRenderTemplate,
			this.transform,
		)?.GetAirshipComponent<AvatarRenderComponent>();
	}

	public PlayReaction(slotType: AccessorySlot) {
		// if (math.random() < this.oddsOfAReaction) {
		// 	this.anim.SetInteger("ReactionIndex", math.random(3) - 1);
		// 	this.anim.SetTrigger("React");
		// }
	}
}
