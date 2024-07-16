import { CameraTransform } from "./CameraTransform";

/**
 * Represents a camera mode that can attached to the camera system.
 */
export abstract class CameraMode {
	public rotationX = math.rad(90);
	public rotationY = math.rad(0);

	abstract GetFriendlyName(): string;

	/** Called when the camera mode starts. */
	abstract OnStart(camera: Camera, rootTransform: Transform): void;

	/** Called when the camera mode stops. */
	abstract OnStop(): void;

	/** Called every frame. Useful for control logic. */
	abstract OnUpdate(deltaTime: number): void;

	/** Called every frame. Use this method for constructing the `CameraTransform`. */
	abstract OnLateUpdate(deltaTime: number): CameraTransform;

	abstract OnPostUpdate(camera: Camera): void;
}

// Necessary for our Lua plugin to not complain about return type:
export default {};
