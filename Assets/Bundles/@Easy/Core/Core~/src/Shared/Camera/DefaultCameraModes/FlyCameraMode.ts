import { ClientSettingsController } from "Client/MainMenuControllers/Settings/ClientSettingsController";
import { Dependency } from "Shared/Flamework";
import { Keyboard, Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { MathUtil } from "Shared/Util/MathUtil";
import { SignalPriority } from "Shared/Util/Signal";
import { Spring } from "Shared/Util/Spring";
import { CameraMode } from "../CameraMode";
import { CameraTransform } from "../CameraTransform";
import { Game } from "Shared/Game";

const SPEED = 12;

const MIN_ROT_X = math.rad(1);
const MAX_ROT_X = math.rad(179);

const MIN_FOV = 5;
const MAX_FOV = 120;
const START_FOV = 70;

const FOV_SCROLL_SENSITIVITY = 10;

let MOUSE_SENS_SCALAR = 0.02;
if (Game.IsMac()) {
	MOUSE_SENS_SCALAR *= 4;
}
if (!Game.IsEditor()) {
	MOUSE_SENS_SCALAR *= 0.15;
}

export class FlyCameraMode extends CameraMode {
	private bin = new Bin();

	private positionSpring!: Spring;
	private xRotSpring!: Spring;
	private yRotVelSpring!: Spring;
	private fovSpring!: Spring;

	private camera!: Camera;
	private originalFov = 0;
	private currentFov = 0;

	private keyboard!: Keyboard;
	private mouse!: Mouse;
	private readonly keysDown = new Set<Key>();

	private readonly clientSettingsController = Dependency<ClientSettingsController>();

	OnStart(camera: Camera, rootTransform: Transform) {
		const transform = rootTransform;
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
		const sinkKeys = new Set<Key>();
		sinkKeys.add(Key.W);
		sinkKeys.add(Key.A);
		sinkKeys.add(Key.S);
		sinkKeys.add(Key.D);
		sinkKeys.add(Key.UpArrow);
		sinkKeys.add(Key.DownArrow);
		sinkKeys.add(Key.LeftArrow);
		sinkKeys.add(Key.RightArrow);
		sinkKeys.add(Key.Q);
		sinkKeys.add(Key.E);

		for (const key of sinkKeys) {
			this.bin.Add(
				this.keyboard.OnKeyDown(
					key,
					(event) => {
						this.keysDown.add(event.key);
						event.SetCancelled(true);
					},
					SignalPriority.HIGHEST - 100,
				),
			);
			this.bin.Add(
				this.keyboard.OnKeyUp(
					key,
					(event) => {
						this.keysDown.delete(event.key);
						event.SetCancelled(true);
					},
					SignalPriority.HIGHEST - 100,
				),
			);
		}

		this.bin.Connect(this.mouse.scrolled, (event) => {
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
		const up = this.keysDown.has(Key.W) || this.keysDown.has(Key.UpArrow);
		const dn = this.keysDown.has(Key.S) || this.keysDown.has(Key.DownArrow);
		const lf = this.keysDown.has(Key.A) || this.keysDown.has(Key.LeftArrow);
		const rt = this.keysDown.has(Key.D) || this.keysDown.has(Key.RightArrow);
		const q = this.keysDown.has(Key.Q);
		const e = this.keysDown.has(Key.E);

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
		this.rotationX = this.xRotSpring.Update(dt).x;
		this.rotationY = (this.rotationY + this.yRotVelSpring.Update(dt).y) % (math.pi * 2);
	}

	OnPostUpdate() {}

	OnLateUpdate(dt: number) {
		const fov = this.fovSpring.Update(dt).z;
		this.currentFov = fov;
		this.camera.fieldOfView = fov;

		const position = this.positionSpring.Update(dt);
		const rotation = Quaternion.Euler(math.deg(-this.rotationX + math.pi / 2), math.deg(-this.rotationY), 0);

		return new CameraTransform(position, rotation);
	}

	private CalculateDirection(): Vector3 {
		const yRot = this.rotationY - math.pi / 2;
		const xPos = math.cos(yRot) * math.sin(this.rotationX);
		const zPos = math.sin(yRot) * math.sin(this.rotationX);
		const yPos = math.cos(this.rotationX);
		return new Vector3(xPos, yPos, zPos);
	}
}
