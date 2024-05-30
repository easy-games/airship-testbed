import { AirshipCharacterCameraSingleton } from "../../../Camera/AirshipCharacterCameraSingleton";
import { Dependency } from "../../../Flamework";
import { Bin } from "../../../Util/Bin";
import { CanvasAPI } from "../../../Util/CanvasAPI";

const MIN_ROT_X = math.rad(1);
const MAX_ROT_X = math.rad(179);
const TAU = math.pi * 2;
const SENS_SCALAR = 0.01;

export default class MobileCameraMovement extends AirshipBehaviour {
	private bin = new Bin();
	private touchStartPos = Vector2.zero;
	private touchStartRotX = 0;
	private touchStartRotY = 0;
	private touchPointerId = 0;

	override OnEnable(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnBeginDragEvent(this.gameObject, (data) => {
				const camSystem = Dependency<AirshipCharacterCameraSingleton>().cameraSystem;
				if (!camSystem) return;
				const camMode = camSystem.GetMode();

				// print("Begin drag. pointerId=" + data.pointerId + ", position=" + data.position);
				this.touchPointerId = data.pointerId;
				this.touchStartPos = data.position;
				this.touchStartRotX = camMode.rotationX;
				this.touchStartRotY = camMode.rotationY;
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnDragEvent(this.gameObject, (data) => {
				const camSystem = Dependency<AirshipCharacterCameraSingleton>().cameraSystem;
				if (!camSystem) return;
				const camMode = camSystem.GetMode();

				// print("Dragging. pointerId=" + data.pointerId + ", position=" + data.position);
				if (this.touchPointerId !== data.pointerId) return;

				const deltaPosSinceStart = data.position.sub(this.touchStartPos);
				const touchSensitivity = contextbridge.invoke<() => number>(
					"ClientSettings:GetTouchSensitivity",
					LuauContext.Protected,
				);
				camMode.rotationY = (this.touchStartRotY - deltaPosSinceStart.x * SENS_SCALAR * touchSensitivity) % TAU;
				camMode.rotationX = math.clamp(
					this.touchStartRotX + deltaPosSinceStart.y * SENS_SCALAR * touchSensitivity,
					MIN_ROT_X,
					MAX_ROT_X,
				);
			}),
		);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnEndDragEvent(this.gameObject, (data) => {
				if (this.touchPointerId === data.pointerId) {
					this.touchPointerId = -1;
				}
			}),
		);
	}

	// public Update(dt: number): void {
	// 	print("mouse locked: " + Mouse.global.IsLocked());
	// }

	override OnDisable(): void {
		this.bin.Clean();
	}
}
