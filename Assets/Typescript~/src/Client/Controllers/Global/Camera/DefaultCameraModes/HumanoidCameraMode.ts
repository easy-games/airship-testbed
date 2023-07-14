import { Dependency } from "@easy-games/flamework-core";
import { Keyboard, Mouse, Preferred, Touchscreen } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { MathUtil } from "Shared/Util/MathUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { SpringTween } from "Shared/Util/SpringTween";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { CameraMode, CameraTransform } from "../../Camera";
import { ClientSettingsController } from "../../ClientSettings/ClientSettingsController";

// Lua's bitwise operations is unsigned, but C#'s is signed, so we need to hardcode the mask:
// Character layer: 3
// BridgeAssist layer: 7
// Bitwise operation to ignore layers above: ~(1 << 3 | 1 << 7)
const CHARACTER_MASK = -137;

const MIN_ROT_X = math.rad(1);
const MAX_ROT_X = math.rad(179);

const XZ_LOCKED_OFFSET = new Vector3(0.3, 0, 3.5);
const Y_LOCKED_ROTATION = math.rad(15);

const ANGLE_EPSILON = 0.0001;

let MOUSE_SENS_SCALAR = 0.2;
if (RunUtil.IsMac()) {
	MOUSE_SENS_SCALAR *= 4;
}

export class HumanoidCameraMode implements CameraMode {
	private readonly bin = new Bin();

	private lookAngle = 0;
	private forwardDirection = new Vector3(0, 0, 1);
	private readonly entityDriver: EntityDriver;
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
	private lastCamPos = new Vector3(0, 0, 0);

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
		this.entityDriver = characterGO.GetComponent<EntityDriver>();
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
		touchscreen.Pan.Connect((position, phase) => {
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
						(math.pi * 2);
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
			this.occlusionCam = camera.transform.gameObject.AddComponent("OcclusionCam") as OcclusionCam;
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
			if (!this.firstPerson && !this.lockView) {
				this.mouse.SetLocation(this.rightClickPos);
			}
			this.rotationY =
				(this.rotationY -
					mouseDelta.x * this.clientSettingsController.GetMouseSensitivity() * MOUSE_SENS_SCALAR) %
				(math.pi * 2);
			this.rotationX = math.clamp(
				this.rotationX + mouseDelta.y * this.clientSettingsController.GetMouseSensitivity() * MOUSE_SENS_SCALAR,
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
			const [newYOffset, isDone] = this.yOffsetSpring.update(dt);
			this.yOffset = newYOffset.y;
			if (isDone) {
				this.yOffsetSpring = undefined;
			}
		}

		const attachToPos = this.attachTo.position.add(new Vector3(0, this.yOffset, 0)).add(this.camRight.mul(xOffset));
		this.lastAttachToPos = attachToPos;

		let newPosition = this.firstPerson ? attachToPos : attachToPos.add(posOffset);
		let rotation: Quaternion;

		const lv = posOffset.mul(-1).normalized;
		rotation = Quaternion.LookRotation(lv, new Vector3(0, 1, 0));

		this.lastCamPos = newPosition;

		return new CameraTransform(newPosition, rotation);
	}

	OnPostUpdate(camera: Camera) {
		const transform = camera.transform;
		if (!this.firstPerson) {
			transform.LookAt(this.lastAttachToPos);
			this.occlusionCam.BumpForOcclusion(this.lastAttachToPos, CHARACTER_MASK);
			this.lastCamPos = transform.position;
		}
		this.camRight = transform.right;
		this.CalculateDirectionAndAngle(this.lastCamPos, transform.forward);
	}

	private CalculateDirectionAndAngle(position: Vector3, forward: Vector3) {
		let forwardPos = position.add(forward.mul(100));
		forwardPos = new Vector3(forwardPos.x, position.y, forwardPos.z);
		const forwardDir = forwardPos.sub(position).normalized;
		this.forwardDirection = new Vector3(forwardDir.x, 0, forwardDir.z);

		const lastLookAngle = this.lookAngle;
		let newLookAngle = math.atan2(-this.forwardDirection.x, this.forwardDirection.z);
		if (this.lookBackwards && !this.firstPerson) {
			newLookAngle += math.pi;
		}

		// Only update the Humanoid if there's a bit of a change:
		if (math.abs(lastLookAngle - newLookAngle) > ANGLE_EPSILON) {
			this.lookAngle = newLookAngle;
			this.entityDriver.SetLookAngle(math.deg(this.lookAngle) % 360);
		}
	}

	public SetFirstPerson(firstPerson: boolean) {
		this.firstPerson = firstPerson;
	}

	public SetYOffset(yOffset: number, immediate = false) {
		if (immediate) {
			this.yOffset = yOffset;
			if (this.yOffsetSpring) {
				this.yOffsetSpring.resetTo(new Vector3(0, yOffset, 0));
			}
			return;
		}
		if (this.yOffsetSpring === undefined) {
			this.yOffsetSpring = new SpringTween(new Vector3(0, this.yOffset, 0), 5, 2);
		}
		this.yOffsetSpring.setGoal(new Vector3(0, yOffset, 0));
	}

	public SetLookBackwards(lookBackwards: boolean) {
		this.lookBackwards = lookBackwards;
	}
}
