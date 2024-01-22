import { Dependency } from "@easy-games/flamework-core";
import { CrosshairController } from "Client/Controllers/Crosshair/CrosshairController";
import { ClientSettingsController } from "Client/MainMenuControllers/Settings/ClientSettingsController";
import { Keyboard, Mouse, Preferred, Touchscreen } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { RunUtil } from "Shared/Util/RunUtil";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { CameraMode } from "../CameraMode";
import { CameraTransform } from "../CameraTransform";
import DefaultCameraMask from "../DefaultCameraMask";

const MIN_ROT_X = math.rad(1);
const MAX_ROT_X = math.rad(179);

let MOUSE_SENS_SCALAR = 0.1;
if (RunUtil.IsMac()) {
	MOUSE_SENS_SCALAR *= 6;
}
if (!RunUtil.IsEditor()) {
	MOUSE_SENS_SCALAR *= 0.15;
}
const Y_LOCKED_ROTATION = math.rad(15);
const Y_OFFSET = 1.85;

export class OrbitCameraMode implements CameraMode {
	private readonly bin = new Bin();

	private occlusionCam!: OcclusionCam;

	private rotationX = math.rad(90);
	private rotationY = math.rad(0);

	private lockView = true;
	private rightClicking = false;
	private rightClickPos = Vector3.zero;

	private lookVector = Vector3.zero;
	private lastAttachToPos = Vector3.zero;

	private readonly entityDriver?: HumanMovement;

	private readonly preferred = this.bin.Add(new Preferred());
	private readonly keyboard = this.bin.Add(new Keyboard());
	private readonly touchscreen = this.bin.Add(new Touchscreen());
	private readonly mouse = this.bin.Add(new Mouse());
	private readonly clientSettingsController = Dependency<ClientSettingsController>();

	constructor(private readonly distance: number, private transform: Transform, graphicalCharacter?: Transform) {
		if (graphicalCharacter !== undefined) {
			this.entityDriver = transform.GetComponent<HumanMovement>();
			this.transform = graphicalCharacter;
		}
		this.SetupMobileControls();
	}

	private SetupMobileControls() {
		const touchscreen = this.bin.Add(new Touchscreen());
		let touchStartPos = Vector3.zero;
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
					this.rotationY = (touchStartRotY - deltaPosSinceStart.x * MOUSE_SENS_SCALAR) % (math.pi * 2);
					this.rotationX = math.clamp(
						touchStartRotX + deltaPosSinceStart.y * MOUSE_SENS_SCALAR,
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

	SetTransform(transform: Transform) {
		this.transform = transform;
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

		// const mouseUnlocker = this.mouse.AddUnlocker();
		// this.bin.Add(() => this.mouse.RemoveUnlocker(mouseUnlocker));

		if (!this.lockView) {
			const unlockerId = this.mouse.AddUnlocker();
			this.bin.Add(() => {
				this.mouse.RemoveUnlocker(unlockerId);
			});
		}

		let rightClickUnlocker = this.mouse.AddUnlocker();

		this.bin.Add(
			this.mouse.rightDown.Connect(() => {
				if (rightClickUnlocker === -1) return;
				this.mouse.RemoveUnlocker(rightClickUnlocker);
				rightClickUnlocker = -1;
			}),
		);

		this.bin.Add(
			this.mouse.rightUp.Connect(() => {
				if (rightClickUnlocker !== -1) return;
				rightClickUnlocker = this.mouse.AddUnlocker();
			}),
		);

		this.bin.Add(() => {
			if (rightClickUnlocker === -1) return;
			this.mouse.RemoveUnlocker(rightClickUnlocker);
			rightClickUnlocker = -1;
		});

		this.bin.Add(Dependency<CrosshairController>().AddDisabler());
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
		if (this.mouse.IsLocked() && (rightClick || this.lockView)) {
			const mouseDelta = this.mouse.GetDelta();
			const mouseSensitivity = this.clientSettingsController.GetMouseSensitivity();
			if (!this.lockView) {
				this.mouse.SetLocation(this.rightClickPos);
			}
			this.rotationY = (this.rotationY - mouseDelta.x * mouseSensitivity * MOUSE_SENS_SCALAR) % (math.pi * 2);
			this.rotationX = math.clamp(
				this.rotationX + mouseDelta.y * mouseSensitivity * MOUSE_SENS_SCALAR,
				MIN_ROT_X,
				MAX_ROT_X,
			);
		}
	}

	OnLateUpdate(dt: number) {
		const radius = this.distance;
		const yRotOffset = this.lockView ? Y_LOCKED_ROTATION : 0;

		// Polar to cartesian conversion (i.e. the 3D point around the sphere of the character):
		const rotY = this.rotationY + yRotOffset - math.pi / 2;
		const xPos = radius * math.cos(rotY) * math.sin(this.rotationX);
		const zPos = radius * math.sin(rotY) * math.sin(this.rotationX);
		const yPos = radius * math.cos(this.rotationX);

		const posOffset = new Vector3(xPos, yPos, zPos);
		const attachToPos = this.transform.position.add(new Vector3(0, Y_OFFSET, 0));
		this.lastAttachToPos = attachToPos;

		let newPosition = attachToPos.add(posOffset);
		let rotation: Quaternion;

		const lv = posOffset.mul(-1).normalized;
		rotation = Quaternion.LookRotation(lv, Vector3.up);

		return new CameraTransform(newPosition, rotation);
	}

	OnPostUpdate(camera: Camera) {
		const transform = camera.transform;
		transform.LookAt(this.lastAttachToPos);
		this.occlusionCam.BumpForOcclusion(this.lastAttachToPos, DefaultCameraMask);

		// Update character direction:
		if (this.entityDriver !== undefined) {
			const newLookVector = transform.forward;
			const diff = this.lookVector.Distance(newLookVector);
			if (diff > 0.01) {
				this.entityDriver.SetLookVector(newLookVector);
				this.lookVector = newLookVector;
			}
		}
	}
}
