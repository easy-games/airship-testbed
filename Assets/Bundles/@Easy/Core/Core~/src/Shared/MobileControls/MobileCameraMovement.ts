import { CameraController } from "@Easy/Core/Client/Controllers/Camera/CameraController";
import { ClientSettingsController } from "@Easy/Core/Client/MainMenuControllers/Settings/ClientSettingsController";
import { Dependency } from "../Flamework";
import { Bin } from "../Util/Bin";
import { CanvasAPI } from "../Util/CanvasAPI";

const MIN_ROT_X = math.rad(1);
const MAX_ROT_X = math.rad(179);
const TAU = math.pi * 2;
const SENS_SCALAR = 0.01;

export default class MobileCameraMovement extends AirshipBehaviour {
	private bin = new Bin();
	private touchStartPos = Vector2.zero;
	private touchStartRotX = 0;
	private touchStartRotY = 0;

	override OnEnable(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnBeginDragEvent(this.gameObject, (data) => {
				const camSystem = Dependency<CameraController>().cameraSystem;
				if (!camSystem) return;
				const camMode = camSystem.GetMode();

				this.touchStartPos = data.position;
				this.touchStartRotX = camMode.rotationX;
				this.touchStartRotY = camMode.rotationY;
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnDragEvent(this.gameObject, (data) => {
				const camSystem = Dependency<CameraController>().cameraSystem;
				if (!camSystem) return;
				const camMode = camSystem.GetMode();

				const deltaPosSinceStart = data.position.sub(this.touchStartPos);
				const clientSettingsController = Dependency<ClientSettingsController>();
				camMode.rotationY =
					(this.touchStartRotY -
						deltaPosSinceStart.x * SENS_SCALAR * clientSettingsController.GetTouchSensitivity()) %
					TAU;
				camMode.rotationX = math.clamp(
					this.touchStartRotX +
						deltaPosSinceStart.y * SENS_SCALAR * clientSettingsController.GetTouchSensitivity(),
					MIN_ROT_X,
					MAX_ROT_X,
				);
			}),
		);
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
