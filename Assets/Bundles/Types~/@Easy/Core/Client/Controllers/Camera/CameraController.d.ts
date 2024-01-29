import { CameraMode } from ".";
import { CameraSystem } from "./CameraSystem";
export declare class CameraController {
    static readonly cameraReferenceKey = "CameraRig";
    /** The underlying camera system for the game. */
    readonly cameraSystem?: CameraSystem;
    constructor();
    /**
     * Sets whether or not the camera system is enabled. Disable the
     * camera system if custom camera code is being used.
     */
    SetEnabled(enabled: boolean): void;
    /**
     * Returns `true` if the camera system is enabled.
     */
    IsEnabled(): boolean | undefined;
    /**
     * Set the current camera mode.
     *
     * @param mode New mode.
     */
    SetMode(mode: CameraMode): void;
    /**
     * Sets the camera to a static view.
     */
    ClearMode(): void;
    /**
     * Set the camera's field-of-view.
     * @param fieldOfView Field of view.
     * @param immediate If `true`, goes directly to the FOV without springing towards it.
     */
    SetFOV(fieldOfView: number, immediate?: boolean): void;
}
