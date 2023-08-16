import { Signal, SignalPriority } from "Shared/Util/Signal";
import { Spring } from "Shared/Util/Spring";
import { OnLateUpdate, OnUpdate } from "Shared/Util/Timer";
import { CameraMode } from "./CameraMode";
import { CameraModeTransition } from "./CameraModeTransition";
import { StaticCameraMode } from "./DefaultCameraModes/StaticCameraMode";
import { CameraReferences } from "./CameraReferences";

class TransitionMode implements CameraMode {
	private readonly start: number;

	constructor(
		private readonly config: CameraModeTransition,
		private readonly modeStart: CameraMode,
		private readonly modeGoal: CameraMode,
		private readonly onDone: () => void,
	) {
		this.start = Time.time;
	}

	OnStart() {}

	OnStop() {
		this.modeStart.OnStop();
		this.modeGoal.OnStop();
	}

	OnUpdate(dt: number) {}

	OnPostUpdate() {}

	OnLateUpdate(dt: number) {
		const transformStart = this.modeStart.OnLateUpdate(dt);
		const transformGoal = this.modeGoal.OnLateUpdate(dt);
		const alpha = math.clamp((Time.time - this.start) / this.config.Duration, 0, 1);
		if (alpha === 1) {
			this.onDone();
		}
		return transformStart.Lerp(transformGoal, alpha);
	}
}

/**
 * Drives the camera modes.
 */
export class CameraSystem {
	private currentMode: CameraMode = new StaticCameraMode(new Vector3(0, 10, 0), Quaternion.identity);
	private readonly transform: Transform;
	private readonly camera: Camera;
	private readonly allCameras: Camera[];
	private onClearCallback?: () => CameraMode;
	private modeCleared = true;

	private readonly fovSpring: Spring;
	private fovSpringMoving = false;
	private fovSpringMovingStart = 0;

	public readonly ModeChangedBegin = new Signal<[newMode: CameraMode, oldMode: CameraMode]>();
	public readonly ModeChangedEnd = new Signal<[newMode: CameraMode, oldMode: CameraMode]>();

	constructor() {
		const ref = CameraReferences.Instance();
		this.camera = ref.mainCamera;
		this.allCameras = [ref.mainCamera, ref.uiCamera, ref.fpsCamera];
		this.transform = this.camera.transform;
		this.fovSpring = new Spring(new Vector3(this.camera.fieldOfView, 0, 0), 5);

		this.currentMode.OnStart(this.camera);

		OnUpdate.ConnectWithPriority(SignalPriority.LOWEST, (dt) => {
			this.currentMode.OnUpdate(dt);
		});

		OnLateUpdate.ConnectWithPriority(SignalPriority.HIGHEST, (dt) => {
			const camTransform = this.currentMode.OnLateUpdate(dt);
			this.transform.SetPositionAndRotation(camTransform.position, camTransform.rotation);
			this.currentMode.OnPostUpdate(this.camera);
			if (this.fovSpringMoving) {
				this.UpdateFOVSpring(dt);
			}
		});
	}

	/**
	 * Gets a reference to the current camera mode object.
	 * @returns Camera mode.
	 */
	public GetMode() {
		return this.currentMode;
	}

	/**
	 * Set the current camera mode. If `transition` is provided, then the new
	 * mode will be interpolated from the old mode based on the configuration
	 * provided within `transition`. Otherwise, the camera will snap immediately
	 * to the new mode.
	 *
	 * @param mode New mode.
	 * @param transition Optional transition configuration.
	 */
	public SetMode(mode: CameraMode, transition?: CameraModeTransition) {
		if (mode === this.currentMode) return;
		this.modeCleared = false;

		if (transition === undefined) {
			const oldMode = this.currentMode;
			this.ModeChangedBegin.Fire(mode, oldMode);
			this.currentMode.OnStop();
			this.currentMode = mode;
			this.currentMode.OnStart(this.camera);
			this.ModeChangedEnd.Fire(mode, oldMode);
		} else {
			const oldMode = this.currentMode;
			this.ModeChangedBegin.Fire(mode, oldMode);
			mode.OnStart(this.camera);
			this.currentMode = new TransitionMode(transition, oldMode, mode, () => {
				oldMode.OnStop();
				this.currentMode = mode;
				this.ModeChangedEnd.Fire(mode, oldMode);
			});
		}
	}

	/**
	 * Sets the camera to a static view.
	 *
	 * @param transition Optional transition configuration.
	 */
	public ClearMode(transition?: CameraModeTransition) {
		if (this.onClearCallback) {
			this.SetMode(this.onClearCallback(), transition);
		} else {
			this.SetMode(new StaticCameraMode(this.transform.position, this.transform.rotation), transition);
			this.modeCleared = true;
		}
	}

	/**
	 * Sets a callback function that is called when the camera mode is cleared. This
	 * is useful for defaulting the camera system to a specific camera mode. Only
	 * one callback can be set.
	 *
	 * Leaving out the `onClearCallback` parameter will clear the callback.
	 *
	 * @param onClearCallback Callback.
	 */
	public SetOnClearCallback(onClearCallback?: () => CameraMode) {
		this.onClearCallback = onClearCallback;
		if (this.modeCleared && onClearCallback) {
			this.SetMode(onClearCallback());
		}
	}

	/**
	 * Set the camera's field-of-view.
	 * @param fieldOfView Field of view.
	 * @param immediate If `true`, goes directly to the FOV without springing towards it.
	 */
	public SetFOV(fieldOfView: number, immediate = false) {
		if (immediate) {
			this.fovSpring.resetTo(new Vector3(fieldOfView, 0, 0));
			this.UpdateFOV(fieldOfView);
			this.fovSpringMoving = false;
		} else {
			this.fovSpring.goal = new Vector3(fieldOfView, 0, 0);
			this.fovSpringMoving = true;
			this.fovSpringMovingStart = Time.time;
		}
	}

	private UpdateFOVSpring(dt: number) {
		this.UpdateFOV(this.fovSpring.update(dt).x);
		if (Time.time - this.fovSpringMovingStart > 2 && math.abs(this.fovSpring.velocity.x) < 0.01) {
			this.fovSpringMoving = false;
		}
	}

	private UpdateFOV(newFOV: number) {
		for (let i = 0; i < this.allCameras.size(); i++) {
			this.allCameras[i].fieldOfView = newFOV;
		}
	}
}
