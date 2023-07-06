import { Keyboard, Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { SignalPriority } from "Shared/Util/Signal";
import { Spring } from "Shared/Util/Spring";
import { CameraMode } from "../CameraMode";
import { CameraTransform } from "../CameraTransform";

const SPEED = 12;
const ROTATION_SENSITIVITY = 0.005;

const MIN_ROT_X = math.rad(1);
const MAX_ROT_X = math.rad(179);

export class FlyCameraMode implements CameraMode {
	private bin = new Bin();

	private xRot = math.rad(90);
	private yRot = 0;

	private positionSpring!: Spring;
	private xRotSpring!: Spring;
	private yRotVelSpring!: Spring;

	private keyboard!: Keyboard;
	private mouse!: Mouse;
	private readonly keysDown = new Set<Key>();

	private rightClicking = false;

	OnStart(camera: Camera) {
		const transform = camera.transform;
		this.positionSpring = new Spring(transform.position, 5);
		this.xRotSpring = new Spring(new Vector3(math.rad(90), 0, 0), 5);
		this.yRotVelSpring = new Spring(new Vector3(0, 0, 0), 3);

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
		this.bin.Add(
			this.keyboard.KeyDown.ConnectWithPriority(SignalPriority.HIGHEST, (event) => {
				if (sinkKeys.has(event.Key)) {
					this.keysDown.add(event.Key);
					event.SetCancelled(true);
				}
			}),
		);
		this.bin.Add(
			this.keyboard.KeyUp.ConnectWithPriority(SignalPriority.HIGHEST, (event) => {
				if (sinkKeys.has(event.Key)) {
					this.keysDown.delete(event.Key);
				}
			}),
		);
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
		this.rightClicking = rightClick;
		if (rightClick) {
			const mouseDelta = this.mouse.GetDelta();
			this.xRotSpring.goal = new Vector3(
				math.clamp(this.xRotSpring.goal.x + mouseDelta.y * ROTATION_SENSITIVITY, MIN_ROT_X, MAX_ROT_X),
				0,
				0,
			);
			this.xRot = this.xRotSpring.update(dt).x;
			this.yRotVelSpring.goal = new Vector3(0, -mouseDelta.x * ROTATION_SENSITIVITY, 0);
		} else {
			this.yRotVelSpring.goal = new Vector3(0, 0, 0);
		}
		this.yRot = (this.yRot + this.yRotVelSpring.update(dt).y) % (math.pi * 2);
	}

	OnPostUpdate() {}

	OnLateUpdate(dt: number) {
		const position = this.positionSpring.update(dt);
		const rotation = Quaternion.Euler(-this.xRot + math.pi / 2, -this.yRot, 0);
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
