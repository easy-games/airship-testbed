import { Dependency } from "@easy-games/flamework-core";
import { ClientSettingsController } from "Client/MainMenuControllers/Settings/ClientSettingsController";
import { Keyboard, Mouse, Preferred, Touchscreen } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { MathUtil } from "Shared/Util/MathUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { SpringTween } from "Shared/Util/SpringTween";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { CameraMode, CameraTransform } from "..";
import DefaultCameraMask from "../DefaultCameraMask";

const MIN_ROT_X = math.rad(1);
const MAX_ROT_X = math.rad(179);

const XZ_LOCKED_OFFSET = new Vector3(0.45, 0, 3.5);
const Y_LOCKED_ROTATION = 0;

const TAU = math.pi * 2;

let MOUSE_SENS_SCALAR = 0.1;
if (RunUtil.IsMac()) {
	MOUSE_SENS_SCALAR *= 6;
}
if (!RunUtil.IsEditor()) {
	MOUSE_SENS_SCALAR *= 0.15;
}

export class HumanoidCameraMode implements CameraMode {
	private readonly bin = new Bin();

	private lookVector = Vector3.zero;
	private readonly entityDriver: HumanMovement;
	private occlusionCam!: OcclusionCam;
	private lookBackwards = false;

	private readonly attachTo: Transform;

	private rotationX = math.rad(90);
	private rotationY = math.rad(0);

	private lockView = true;
	private firstPerson = true;
	private rightClicking = false;
	private rightClickPos = Vector3.zero;
	private camRight = new Vector3(0, 0, 1);

	private lastAttachToPos = new Vector3(0, 0, 0);

	private yOffset = 0;
	private yOffsetSpring: SpringTween | undefined;

	private readonly preferred = this.bin.Add(new Preferred());
	private readonly keyboard = this.bin.Add(new Keyboard());
	private readonly touchscreen = this.bin.Add(new Touchscreen());
	private readonly mouse = this.bin.Add(new Mouse());
	private readonly clientSettingsController = Dependency<ClientSettingsController>();

	constructor(
		private characterGO: GameObject,
		private graphicalCharacterGO: GameObject,
		initialFirstPerson: boolean,
		initialYOffset: number,
	) {
		this.entityDriver = characterGO.GetComponent<HumanMovement>();
		this.attachTo = graphicalCharacterGO.transform;
		this.firstPerson = initialFirstPerson;
		this.yOffset = initialYOffset;
		this.SetupMobileControls();

		this.bin.Add(() => {});
	}

	private SetupMobileControls() {
		const touchscreen = this.bin.Add(new Touchscreen());
		let touchStartPos = new Vector3(0, 0, 0);
		let touchStartRotX = 0;
		let touchStartRotY = 0;
		let touchOverUI = false;
		touchscreen.pan.Connect((position, phase) => {
			switch (phase) {
				case TouchPhase.Began:
					if (UserInputService.InputProxy.IsPointerOverUI()) {
						touchOverUI = true;
					} else {
						touchOverUI = false;
						touchStartPos = position;
						touchStartRotX = this.rotationX;
						touchStartRotY = this.rotationY;
					}
					break;
				case TouchPhase.Moved: {
					if (touchOverUI) break;
					const deltaPosSinceStart = position.sub(touchStartPos);
					this.rotationY =
						(touchStartRotY - deltaPosSinceStart.x * this.clientSettingsController.GetTouchSensitivity()) %
						TAU;
					this.rotationX = math.clamp(
						touchStartRotX + deltaPosSinceStart.y * this.clientSettingsController.GetTouchSensitivity(),
						MIN_ROT_X,
						MAX_ROT_X,
					);
					break;
				}
				case TouchPhase.Ended:
					touchOverUI = false;
					break;
				default:
					break;
			}
		});
	}

	OnStart(camera: Camera) {
		this.occlusionCam = camera.transform.GetComponent<OcclusionCam>();
		if (this.occlusionCam === undefined) {
			this.occlusionCam = camera.transform.gameObject.AddComponent<OcclusionCam>();
		}
		this.bin.Add(this.preferred);
		this.bin.Add(this.keyboard);
		this.bin.Add(this.touchscreen);
		this.bin.Add(this.mouse);

		if (!this.lockView) {
			const unlockerId = this.mouse.AddUnlocker();
			this.bin.Add(() => {
				this.mouse.RemoveUnlocker(unlockerId);
			});
		}

		this.SetFirstPerson(this.firstPerson);
		this.SetDirection(this.graphicalCharacterGO.transform.forward);
	}

	OnStop() {
		this.bin.Clean();
	}

	OnUpdate(dt: number) {
		const lf = this.keyboard.IsKeyDown(KeyCode.LeftArrow);
		const rt = this.keyboard.IsKeyDown(KeyCode.RightArrow);
		const rightClick = this.mouse.IsRightButtonDown();
		if (rightClick && !this.rightClicking) {
			this.rightClickPos = this.mouse.GetLocation();
		}
		this.rightClicking = rightClick;
		if (lf !== rt) {
			this.rotationY += (lf ? 1 : -1) * TimeUtil.GetDeltaTime() * 4;
		}
		if (this.mouse.IsLocked() && (rightClick || this.firstPerson || this.lockView)) {
			const mouseDelta = this.mouse.GetDelta();
			const mouseSensitivity = this.clientSettingsController.GetMouseSensitivity();
			if (!this.firstPerson && !this.lockView) {
				this.mouse.SetLocation(this.rightClickPos);
			}
			this.rotationY = (this.rotationY - mouseDelta.x * mouseSensitivity * MOUSE_SENS_SCALAR) % TAU;
			this.rotationX = math.clamp(
				this.rotationX + mouseDelta.y * mouseSensitivity * MOUSE_SENS_SCALAR,
				MIN_ROT_X,
				MAX_ROT_X,
			);
		}
	}

	OnLateUpdate(dt: number) {
		let xOffset = this.lockView && !this.firstPerson ? XZ_LOCKED_OFFSET.x : 0;
		if (this.lockView && !this.firstPerson) {
			if (this.rotationX < math.rad(45)) {
				xOffset = MathUtil.Map(this.rotationX, MIN_ROT_X, math.rad(45), 0, xOffset);
			}
		}
		const zOffset = XZ_LOCKED_OFFSET.z;
		const radius = this.firstPerson ? 1 : zOffset;
		const yRotOffset = this.lockView
			? Y_LOCKED_ROTATION + (this.lookBackwards && !this.firstPerson ? math.pi : 0)
			: 0;

		// Polar to cartesian conversion (i.e. the 3D point around the sphere of the character):
		const rotY = this.rotationY + yRotOffset - math.pi / 2;
		const xPos = radius * math.cos(rotY) * math.sin(this.rotationX);
		const zPos = radius * math.sin(rotY) * math.sin(this.rotationX);
		const yPos = radius * math.cos(this.rotationX);

		const posOffset = new Vector3(xPos, yPos, zPos);

		if (this.yOffsetSpring !== undefined) {
			const [newYOffset, isDone] = this.yOffsetSpring.Update(dt);
			this.yOffset = newYOffset.y;
			if (isDone) {
				this.yOffsetSpring = undefined;
			}
		}

		const attachToPos = this.attachTo.position.add(new Vector3(0, this.yOffset, 0)).add(this.camRight.mul(xOffset));
		this.lastAttachToPos = attachToPos;

		const newPosition = this.firstPerson ? attachToPos : attachToPos.add(posOffset);
		const lv = posOffset.mul(-1).normalized;
		const rotation = Quaternion.LookRotation(lv, Vector3.up);

		return new CameraTransform(newPosition, rotation);
	}

	OnPostUpdate(camera: Camera) {
		const transform = camera.transform;
		if (!this.firstPerson) {
			transform.LookAt(this.lastAttachToPos);
			this.occlusionCam.BumpForOcclusion(this.lastAttachToPos, DefaultCameraMask);
		}
		this.camRight = transform.right;

		const newLookVector = this.lookBackwards && !this.firstPerson ? transform.forward.mul(-1) : transform.forward;
		const diff = this.lookVector.sub(newLookVector).magnitude;
		if (diff > 0.01) {
			this.entityDriver.SetLookVector(newLookVector);
			this.lookVector = newLookVector;
		}
	}

	public SetFirstPerson(firstPerson: boolean) {
		this.firstPerson = firstPerson;
	}

	public SetYOffset(yOffset: number, immediate = false) {
		if (immediate) {
			this.yOffset = yOffset;
			if (this.yOffsetSpring) {
				this.yOffsetSpring.ResetTo(new Vector3(0, yOffset, 0));
			}
			return;
		}
		if (this.yOffsetSpring === undefined) {
			this.yOffsetSpring = new SpringTween(new Vector3(0, this.yOffset, 0), 5, 2);
		}
		this.yOffsetSpring.SetGoal(new Vector3(0, yOffset, 0));
	}

	public SetLookBackwards(lookBackwards: boolean) {
		this.lookBackwards = lookBackwards;
	}

	/**
	 * Explicitly set the direction of the camera on the Y-axis based on the given directional vector.
	 */
	public SetDirection(direction: Vector3) {
		// Determine Y-axis rotation based on direction:
		direction = direction.normalized;
		this.rotationY = math.atan2(-direction.x, direction.z) % TAU;
		this.entityDriver.SetLookVector(direction);
	}
}
