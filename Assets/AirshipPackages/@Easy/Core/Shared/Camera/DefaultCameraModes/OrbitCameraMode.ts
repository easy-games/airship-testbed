import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { ControlScheme, Keyboard, Mouse, Preferred, Touchscreen } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { TimeUtil } from "@Easy/Core/Shared/Util/TimeUtil";
import { CameraMode } from "../CameraMode";
import { CameraTransform } from "../CameraTransform";
import DefaultCameraMask from "../DefaultCameraMask";

const MIN_ROT_X = math.rad(1);
const MAX_ROT_X = math.rad(179);

let MOUSE_SENS_SCALAR = 0.02;
if (Game.IsMac()) {
	MOUSE_SENS_SCALAR *= 5;
}
if (!Game.IsEditor()) {
	MOUSE_SENS_SCALAR *= 0.15;
}
const Y_LOCKED_ROTATION = math.rad(15);
const Y_OFFSET = 1.85;

export class OrbitCameraMode extends CameraMode {
	private readonly bin = new Bin();

	private occlusionCam!: OcclusionCam;

	private lockView = true;
	private rightClicking = false;
	private rightClickPos = Vector2.zero;

	private lookVector = Vector3.zero;
	private lastAttachToPos = Vector3.zero;

	private readonly entityDriver?: CharacterMovement;

	private mouseLocked = false;
	private mouseLockSwapped = false;

	private readonly preferred = this.bin.Add(new Preferred());
	private readonly keyboard = this.bin.Add(new Keyboard());
	private readonly touchscreen = this.bin.Add(new Touchscreen());
	private readonly mouse = this.bin.Add(new Mouse());

	constructor(
		private readonly distance: number,
		private transform: Transform,
		graphicalCharacter?: Transform,
	) {
		super();
		if (graphicalCharacter !== undefined) {
			this.entityDriver = transform.GetComponent<CharacterMovement>()!;
			this.transform = graphicalCharacter;
		}
		// this.SetupMobileControls();
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
					if (InputBridge.Instance.IsPointerOverUI()) {
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

	OnStart(camera: Camera, rootTransform: Transform) {
		this.occlusionCam = rootTransform.GetComponent<OcclusionCam>()!;
		if (this.occlusionCam === undefined) {
			this.occlusionCam = rootTransform.gameObject.AddComponent<OcclusionCam>();
		}
		this.occlusionCam.Init(camera);

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

		this.bin.Add(
			Airship.Input.preferredControls.ObserveControlScheme((scheme) => {
				const controlSchemeBin = new Bin();
				if (scheme === ControlScheme.MouseKeyboard) {
					let rightClickUnlocker = this.mouse.AddUnlocker();

					controlSchemeBin.Add(
						this.mouse.rightDown.Connect(() => {
							if (rightClickUnlocker === -1) return;
							this.mouse.RemoveUnlocker(rightClickUnlocker);
							rightClickUnlocker = -1;
						}),
					);

					controlSchemeBin.Add(
						this.mouse.rightUp.Connect(() => {
							if (rightClickUnlocker !== -1) return;
							rightClickUnlocker = this.mouse.AddUnlocker();
						}),
					);

					controlSchemeBin.Add(() => {
						if (rightClickUnlocker === -1) return;
						this.mouse.RemoveUnlocker(rightClickUnlocker);
						rightClickUnlocker = -1;
					});
				} else if (scheme === ControlScheme.Touch) {
					let lockId = this.mouse.AddUnlocker();
					controlSchemeBin.Add(() => {
						this.mouse.RemoveUnlocker(lockId);
					});
				}
				return () => {
					controlSchemeBin.Clean();
				};
			}),
		);
	}

	OnStop() {
		this.bin.Clean();
	}

	OnUpdate(dt: number) {
		const lf = this.keyboard.IsKeyDown(Key.LeftArrow);
		const rt = this.keyboard.IsKeyDown(Key.RightArrow);
		const rightClick = this.mouse.IsRightButtonDown();
		if (rightClick && !this.rightClicking) {
			this.rightClickPos = this.mouse.GetPosition();
		}
		this.rightClicking = rightClick;
		if (lf !== rt) {
			this.rotationY += (lf ? 1 : -1) * TimeUtil.GetDeltaTime() * 4;
		}
		if (this.mouse.IsLocked() && (rightClick || this.lockView)) {
			let mouseDelta = this.mouse.GetDelta();
			// This is to prevent large jump on first movement (happens always on mac)
			if (this.mouseLockSwapped && mouseDelta.magnitude > 0) {
				this.mouseLockSwapped = false;
				mouseDelta = new Vector2(0, 0);
			}

			const mouseSensitivity = Airship.Input.GetMouseSensitivity();
			if (!this.lockView) {
				// this.mouse.SetPosition(this.rightClickPos);
			}
			this.rotationY = (this.rotationY - mouseDelta.x * mouseSensitivity * MOUSE_SENS_SCALAR) % (math.pi * 2);
			this.rotationX = math.clamp(
				this.rotationX + mouseDelta.y * mouseSensitivity * MOUSE_SENS_SCALAR,
				MIN_ROT_X,
				MAX_ROT_X,
			);
		}

		// Update mouse locked state. This will make the next frame's delta be 0.
		if (this.mouseLocked !== this.mouse.IsLocked()) {
			this.mouseLocked = !this.mouseLocked;
			this.mouseLockSwapped = true;
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
