import ObjectUtils from "@easy-games/unity-object-utils";
import { Bin } from "Shared/Util/Bin";
import { SignalPriority } from "Shared/Util/Signal";
import { Spring } from "Shared/Util/Spring";
import { OnLateUpdate, OnUpdate } from "Shared/Util/Timer";
import { CameraMode } from "./CameraMode";
import { CameraReferences } from "./CameraReferences";
import { CameraTransform } from "./CameraTransform";
import { CharacterCameraType } from "./CharacterCameraType";
import { StaticCameraMode } from "./DefaultCameraModes/StaticCameraMode";

interface FovState {
	readonly fovSpring: Spring;
	fovSpringMoving: boolean;
	fovSpringMovingStart: number;
}

/**
 * Drives the camera modes.
 */
export class CameraSystem {
	private currentMode: CameraMode;
	private readonly transform: Transform;
	private readonly mainCamera: Camera;
	private readonly uiCamera: Camera;
	private readonly viewmodelCamera: Camera;
	private readonly allCameras: Camera[];
	private onClearCallback?: () => CameraMode;
	private updateTransformCallbacks = new Set<(transform: CameraTransform) => CameraTransform | void>();
	private modeCleared = true;

	private fovStateMap = new Map<CharacterCameraType, FovState>();

	private enabled = true;
	private readonly enabledBin = new Bin();

	public GetActiveCamera(): Camera {
		return this.mainCamera;
	}

	constructor() {
		const ref = CameraReferences.Instance();
		this.mainCamera = ref.mainCamera!;
		this.viewmodelCamera = ref.fpsCamera!;
		this.uiCamera = ref.uiCamera!;
		this.allCameras = [ref.mainCamera!, ref.uiCamera!, ref.fpsCamera!];
		this.transform = ref.cameraHolder ?? this.mainCamera.transform;
		// Register FOV state
		for (const cameraType of ObjectUtils.values(CharacterCameraType)) {
			this.fovStateMap.set(cameraType, {
				fovSpring: new Spring(new Vector3(this.mainCamera.fieldOfView, 0, 0), 5),
				fovSpringMoving: false,
				fovSpringMovingStart: 0,
			});
		}
		this.currentMode = new StaticCameraMode(this.mainCamera.transform.position, this.mainCamera.transform.rotation);

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
			let camTransform = this.currentMode.OnLateUpdate(dt);

			// Run game specified functions to update CameraTransform
			for (const updateFunc of this.updateTransformCallbacks) {
				const newTransform = updateFunc(camTransform);
				if (newTransform) camTransform = newTransform;
			}

			this.transform.SetPositionAndRotation(camTransform.position, camTransform.rotation);
			this.currentMode.OnPostUpdate(this.mainCamera);
			for (const [cameraType, fovState] of this.fovStateMap) {
				this.UpdateFOVSpring(cameraType, fovState, dt);
			}
		});

		// Reset FOV spring on enabled and on disabled:
		for (const [cameraType, fovState] of this.fovStateMap) {
			this.SetFOV(cameraType, fovState.fovSpring.goal.x, true);
		}
		this.enabledBin.Add(() => {
			for (const [cameraType, fovState] of this.fovStateMap) {
				this.SetFOV(cameraType, fovState.fovSpring.goal.x, true);
			}
		});

		this.currentMode.OnStart(this.mainCamera, this.transform);
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
		if (this.enabled) this.currentMode.OnStart(this.mainCamera, this.transform);
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
	public SetFOV(cameraType: CharacterCameraType, fieldOfView: number, immediate = false) {
		const fovState = this.fovStateMap.get(cameraType);
		if (!fovState) error("Could not set FOV, unknown camera type.");

		if (immediate) {
			fovState.fovSpring.ResetTo(new Vector3(fieldOfView, 0, 0));
			this.UpdateFOV(cameraType, fieldOfView);
			fovState.fovSpringMoving = false;
		} else {
			fovState.fovSpring.goal = new Vector3(fieldOfView, 0, 0);
			fovState.fovSpringMoving = true;
			fovState.fovSpringMovingStart = Time.time;
		}
	}

	private UpdateFOVSpring(cameraType: CharacterCameraType, fovState: FovState, dt: number) {
		this.UpdateFOV(cameraType, fovState.fovSpring.Update(dt).x);
		if (Time.time - fovState.fovSpringMovingStart > 2 && math.abs(fovState.fovSpring.velocity.x) < 0.01) {
			fovState.fovSpringMoving = false;
		}
	}

	private UpdateFOV(cameraType: CharacterCameraType, newFOV: number) {
		let camerasToUpdate: Camera[] = [];
		switch (cameraType) {
			case CharacterCameraType.VIEW_MODEL:
				camerasToUpdate = [this.viewmodelCamera];
				break;
			case CharacterCameraType.FIRST_PERSON:
			case CharacterCameraType.THIRD_PERSON:
				camerasToUpdate = [this.mainCamera, this.uiCamera];
				break;
		}

		for (const camera of camerasToUpdate) {
			camera.fieldOfView = newFOV;
		}
	}

	/**
	 * Register a callback to be run after the camera mode has generated a camera transform. Callback can return a modified
	 * CameraTransform to update the camera for this frame.
	 *
	 * @returns Clean up function to unregister callback
	 */
	public OnUpdateTransform(callback: (cameraTransform: CameraTransform) => CameraTransform | void): () => void {
		this.updateTransformCallbacks.add(callback);
		return () => {
			this.updateTransformCallbacks.delete(callback);
		};
	}
}
