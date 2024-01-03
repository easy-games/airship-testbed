import { Controller } from "@easy-games/flamework-core";
import { CameraMode } from ".";
import { CameraSystem } from "./CameraSystem";

@Controller({})
export class CameraController {
	public static readonly cameraReferenceKey = "CameraRig";

	/** The underlying camera system for the game. */
	public readonly cameraSystem: CameraSystem;

	constructor() {
		this.cameraSystem = new CameraSystem();
	}

	/**
	 * Sets whether or not the camera system is enabled. Disable the
	 * camera system if custom camera code is being used.
	 */
	public SetEnabled(enabled: boolean) {
		this.cameraSystem.SetEnabled(enabled);
	}

	/**
	 * Returns `true` if the camera system is enabled.
	 */
	public IsEnabled() {
		return this.cameraSystem.IsEnabled();
	}

	/**
	 * Set the current camera mode.
	 *
	 * @param mode New mode.
	 */
	public SetMode(mode: CameraMode) {
		this.cameraSystem.SetMode(mode);
	}

	/**
	 * Sets the camera to a static view.
	 */
	public ClearMode() {
		this.cameraSystem.ClearMode();
	}

	/**
	 * Set the camera's field-of-view.
	 * @param fieldOfView Field of view.
	 * @param immediate If `true`, goes directly to the FOV without springing towards it.
	 */
	public SetFOV(fieldOfView: number, immediate = false) {
		this.cameraSystem.SetFOV(fieldOfView, immediate);
	}
}
