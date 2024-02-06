import { Bin } from "Shared/Util/Bin";
import { SignalPriority } from "Shared/Util/Signal";
import { Spring } from "Shared/Util/Spring";
import { OnLateUpdate, OnUpdate } from "Shared/Util/Timer";
import { CameraMode } from "./CameraMode";
import { CameraReferences } from "./CameraReferences";
import { StaticCameraMode } from "./DefaultCameraModes/StaticCameraMode";

/**
 * Drives the camera modes.
 */
export class CameraSystem {
	private currentMode: CameraMode;
	private readonly transform: Transform;
	private readonly camera: Camera;
	private readonly allCameras: Camera[];
	private onClearCallback?: () => CameraMode;
	private modeCleared = true;

	private readonly fovSpring: Spring;
	private fovSpringMoving = false;
	private fovSpringMovingStart = 0;

	private enabled = true;
	private readonly enabledBin = new Bin();

	public GetActiveCamera(): Camera {
		return this.camera;
	}

	constructor() {
		const ref = CameraReferences.Instance();
		this.camera = ref.mainCamera!;
		this.allCameras = [ref.mainCamera!, ref.uiCamera!, ref.fpsCamera!];
		this.transform = ref.cameraHolder ?? this.camera.transform;
		this.fovSpring = new Spring(new Vector3(this.camera.fieldOfView, 0, 0), 5);
		this.currentMode = new StaticCameraMode(this.camera.transform.position, this.camera.transform.rotation);

		if (this.enabled) {
			this.OnEnabled();
		} else {
			this.OnDisabled();
		}
	}

	public HasCameraRig(): boolean {
		return CameraReferences.Instance().DoesCameraRigExist();
	}

	private OnEnabled() {
		const stopOnUpdate = OnUpdate.ConnectWithPriority(SignalPriority.LOWEST, (dt) => {
			this.currentMode.OnUpdate(dt);
		});

		const stopOnLateUpdate = OnLateUpdate.ConnectWithPriority(SignalPriority.HIGHEST, (dt) => {
			const camTransform = this.currentMode.OnLateUpdate(dt);
			this.transform.SetPositionAndRotation(camTransform.position, camTransform.rotation);
			this.currentMode.OnPostUpdate(this.camera);
			if (this.fovSpringMoving) {
				this.UpdateFOVSpring(dt);
			}
		});

		// Reset FOV spring on enabled and on disabled:
		this.SetFOV(this.fovSpring.goal.x, true);
		this.enabledBin.Add(() => {
			this.SetFOV(this.fovSpring.goal.x, true);
		});

		this.currentMode.OnStart(this.camera, this.transform);
		this.enabledBin.Add(() => {
			this.currentMode.OnStop();
		});

		this.enabledBin.Add(stopOnUpdate);
		this.enabledBin.Add(stopOnLateUpdate);
	}

	private OnDisabled() {
		this.enabledBin.Clean();
	}

	/**
	 * Sets whether or not the camera system is enabled. Disable the
	 * camera system if custom camera code is being used.
	 */
	public SetEnabled(enabled: boolean) {
		if (this.enabled === enabled) return;
		this.enabled = enabled;
		if (enabled) {
			this.OnEnabled();
		} else {
			this.OnDisabled();
		}
	}

	/**
	 * Returns `true` if the camera system is enabled.
	 */
	public IsEnabled() {
		return this.enabled;
	}

	/**
	 * Gets a reference to the current camera mode object.
	 * @returns Camera mode.
	 */
	public GetMode() {
		return this.currentMode;
	}

	/**
	 * Set the current camera mode.
	 *
	 * @param mode New mode.
	 */
	public SetMode(mode: CameraMode) {
		if (mode === this.currentMode) return;
		this.modeCleared = false;

		if (this.enabled) this.currentMode.OnStop();
		this.currentMode = mode;
		if (this.enabled) this.currentMode.OnStart(this.camera, this.transform);
	}

	/**
	 * Sets the camera to a static view.
	 */
	public ClearMode() {
		if (this.onClearCallback) {
			this.SetMode(this.onClearCallback());
		} else {
			this.SetMode(new StaticCameraMode(this.transform.position, this.transform.rotation));
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
			this.fovSpring.ResetTo(new Vector3(fieldOfView, 0, 0));
			this.UpdateFOV(fieldOfView);
			this.fovSpringMoving = false;
		} else {
			this.fovSpring.goal = new Vector3(fieldOfView, 0, 0);
			this.fovSpringMoving = true;
			this.fovSpringMovingStart = Time.time;
		}
	}

	private UpdateFOVSpring(dt: number) {
		this.UpdateFOV(this.fovSpring.Update(dt).x);
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
