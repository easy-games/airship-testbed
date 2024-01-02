import { Controller, OnStart } from "@easy-games/flamework-core";
import { CameraMode, CameraModeTransition } from ".";
import { CameraSystem } from "./CameraSystem";

@Controller({})
export class CameraController implements OnStart {
	public static readonly CameraReferenceKey: string = "CameraRig";

	/** The underlying camera system for the game. */
	public readonly CameraSystem: CameraSystem;

	constructor() {
		this.CameraSystem = new CameraSystem();
	}

	/**
	 * Proxy for `cameraSystem.SetMode()`.
	 *
	 * Set the current camera mode. If `transition` is provided, then the new
	 * mode will be interpolated from the old mode based on the configuration
	 * provided within `transition`. Otherwise, the camera will snap immediately
	 * to the new mode.
	 *
	 * @param mode New mode.
	 * @param transition Optional transition configuration.
	 */
	public SetMode(mode: CameraMode, transition?: CameraModeTransition) {
		this.CameraSystem.SetMode(mode, transition);
	}

	/**
	 * Proxy for `cameraSystem.ClearMode()`.
	 *
	 * Sets the camera to a static view.
	 *
	 * @param transition Optional transition configuration.
	 */
	public ClearMode(transition?: CameraModeTransition) {
		this.CameraSystem.ClearMode(transition);
	}

	/**
	 * Proxy for `cameraSystem.SetFOV()`.
	 *
	 * Set the camera's field-of-view.
	 * @param fieldOfView Field of view.
	 * @param immediate If `true`, goes directly to the FOV without springing towards it.
	 */
	public SetFOV(fieldOfView: number, immediate = false) {
		this.CameraSystem.SetFOV(fieldOfView, immediate);
	}

	OnStart() {}
}
