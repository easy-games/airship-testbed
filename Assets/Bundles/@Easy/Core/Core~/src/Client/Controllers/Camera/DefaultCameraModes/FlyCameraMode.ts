import { Dependency } from "@easy-games/flamework-core";
import { ClientSettingsController } from "Client/MainMenuControllers/Settings/ClientSettingsController";
import { Keyboard, Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { MathUtil } from "Shared/Util/MathUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { SignalPriority } from "Shared/Util/Signal";
import { Spring } from "Shared/Util/Spring";
import { CameraMode } from "../CameraMode";
import { CameraTransform } from "../CameraTransform";

const SPEED = 12;

const MIN_ROT_X = math.rad(1);
const MAX_ROT_X = math.rad(179);

const MIN_FOV = 5;
const MAX_FOV = 120;
const START_FOV = 70;

const FOV_SCROLL_SENSITIVITY = 10;

let MOUSE_SENS_SCALAR = 0.2;
if (RunUtil.IsMac()) {
	MOUSE_SENS_SCALAR *= 4;
}
if (!RunUtil.IsEditor()) {
	MOUSE_SENS_SCALAR *= 0.15;
}

export class FlyCameraMode implements CameraMode {
	private bin = new Bin();

	private xRot = math.rad(90);
	private yRot = 0;

	private positionSpring!: Spring;
	private xRotSpring!: Spring;
	private yRotVelSpring!: Spring;
	private fovSpring!: Spring;

	private camera!: Camera;
	private originalFov = 0;
	private currentFov = 0;

	private keyboard!: Keyboard;
	private mouse!: Mouse;
	private readonly keysDown = new Set<KeyCode>();

	private readonly clientSettingsController = Dependency<ClientSettingsController>();

	OnStart(camera: Camera) {
		const transform = camera.transform;
		this.positionSpring = new Spring(transform.position, 5);
		this.xRotSpring = new Spring(new Vector3(math.rad(90), 0, 0), 5);
		this.yRotVelSpring = new Spring(new Vector3(0, 0, 0), 3);
		this.fovSpring = new Spring(new Vector3(0, 0, camera.fieldOfView), 5);
		this.fovSpring.goal = new Vector3(0, 0, START_FOV);

		this.camera = camera;
		this.originalFov = camera.fieldOfView;
		this.currentFov = this.originalFov;

		this.keyboard = this.bin.Add(new Keyboard());
		this.mouse = this.bin.Add(new Mouse());

		// Sink keys:
		const sinkKeys = new Set<KeyCode>();
		sinkKeys.add(KeyCode.W);
		sinkKeys.add(KeyCode.A);
		sinkKeys.add(KeyCode.S);
		sinkKeys.add(KeyCode.D);
		sinkKeys.add(KeyCode.UpArrow);
		sinkKeys.add(KeyCode.DownArrow);
		sinkKeys.add(KeyCode.LeftArrow);
		sinkKeys.add(KeyCode.RightArrow);
		sinkKeys.add(KeyCode.Q);
		sinkKeys.add(KeyCode.E);

		for (const key of sinkKeys) {
			this.bin.Add(
				this.keyboard.OnKeyDown(
					key,
					(event) => {
						this.keysDown.add(event.keyCode);
						event.SetCancelled(true);
					},
					SignalPriority.HIGHEST,
				),
			);
			this.bin.Add(
				this.keyboard.OnKeyUp(
					key,
					(event) => {
						this.keysDown.delete(event.keyCode);
						event.SetCancelled(true);
					},
					SignalPriority.HIGHEST,
				),
			);
		}

		this.bin.Connect(this.mouse.Scrolled, (event) => {
			const delta = -event.delta * FOV_SCROLL_SENSITIVITY;
			this.fovSpring.goal = new Vector3(0, 0, math.clamp(this.fovSpring.goal.z + delta, MIN_FOV, MAX_FOV));
		});

		this.bin.Add(() => {
			this.camera.fieldOfView = this.originalFov;
		});
	}

	OnStop() {
		this.bin.Clean();
	}

	OnUpdate(dt: number) {
		// Input:
		const up = this.keysDown.has(KeyCode.W) || this.keysDown.has(KeyCode.UpArrow);
		const dn = this.keysDown.has(KeyCode.S) || this.keysDown.has(KeyCode.DownArrow);
		const lf = this.keysDown.has(KeyCode.A) || this.keysDown.has(KeyCode.LeftArrow);
		const rt = this.keysDown.has(KeyCode.D) || this.keysDown.has(KeyCode.RightArrow);
		const q = this.keysDown.has(KeyCode.Q);
		const e = this.keysDown.has(KeyCode.E);

		const direction = this.CalculateDirection();

		// Build move vector:
		let moveVector = new Vector3(0, 0, 0);
		if (up !== dn) {
			moveVector = moveVector.add(direction.mul(dn ? 1 : -1));
		}
		if (lf !== rt) {
			const perpendicular = direction.Cross(Vector3.up);
			moveVector = moveVector.add(perpendicular.mul(rt ? 1 : -1));
		}
		if (q !== e) {
			const perpendicular = direction.Cross(Vector3.up);
			const upwards = direction.Cross(perpendicular);
			moveVector = moveVector.add(upwards.mul(q ? 1 : -1));
		}

		// Set new position:
		if (moveVector.sqrMagnitude > 0) {
			this.positionSpring.goal = this.positionSpring.goal.add(moveVector.normalized.mul(SPEED * dt));
		}

		// Handle camera rotation when right-clicking:
		const rightClick = this.mouse.IsRightButtonDown();
		if (rightClick) {
			const sensFovScalar = MathUtil.Map(this.currentFov, MIN_FOV, MAX_FOV, 0.2, 1);
			const mouseDelta = this.mouse.GetDelta();
			const sensitivity = this.clientSettingsController.GetMouseSensitivity() * MOUSE_SENS_SCALAR * sensFovScalar;
			this.xRotSpring.goal = new Vector3(
				math.clamp(this.xRotSpring.goal.x + mouseDelta.y * sensitivity, MIN_ROT_X, MAX_ROT_X),
				0,
				0,
			);
			this.yRotVelSpring.goal = new Vector3(0, -mouseDelta.x * sensitivity, 0);
		} else {
			this.yRotVelSpring.goal = new Vector3(0, 0, 0);
		}
		this.xRot = this.xRotSpring.update(dt).x;
		this.yRot = (this.yRot + this.yRotVelSpring.update(dt).y) % (math.pi * 2);
	}

	OnPostUpdate() {}

	OnLateUpdate(dt: number) {
		const fov = this.fovSpring.update(dt).z;
		this.currentFov = fov;
		this.camera.fieldOfView = fov;

		const position = this.positionSpring.update(dt);
		const rotation = Quaternion.Euler(math.deg(-this.xRot + math.pi / 2), math.deg(-this.yRot), 0);

		return new CameraTransform(position, rotation);
	}

	private CalculateDirection(): Vector3 {
		const yRot = this.yRot - math.pi / 2;
		const xPos = math.cos(yRot) * math.sin(this.xRot);
		const zPos = math.sin(yRot) * math.sin(this.xRot);
		const yPos = math.cos(this.xRot);
		return new Vector3(xPos, yPos, zPos);
	}
}
