import { CameraMode } from "./CameraMode";
import { CameraTransform } from "./CameraTransform";
import { CharacterCameraType } from "./CharacterCameraType";
/**
 * Drives the camera modes.
 */
export declare class CameraSystem {
    private currentMode;
    private readonly transform;
    private readonly mainCamera;
    private readonly uiCamera;
    private readonly viewmodelCamera;
    private readonly allCameras;
    private onClearCallback?;
    private updateTransformCallbacks;
    private modeCleared;
    private fovStateMap;
    private enabled;
    private readonly enabledBin;
    GetActiveCamera(): Camera;
    constructor();
    HasCameraRig(): boolean;
    private OnEnabled;
    private OnDisabled;
    /**
     * Sets whether or not the camera system is enabled. Disable the
     * camera system if custom camera code is being used.
     */
    SetEnabled(enabled: boolean): void;
    /**
     * Returns `true` if the camera system is enabled.
     */
    IsEnabled(): boolean;
    /**
     * Gets a reference to the current camera mode object.
     * @returns Camera mode.
     */
    GetMode(): CameraMode;
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
     * Sets a callback function that is called when the camera mode is cleared. This
     * is useful for defaulting the camera system to a specific camera mode. Only
     * one callback can be set.
     *
     * Leaving out the `onClearCallback` parameter will clear the callback.
     *
     * @param onClearCallback Callback.
     */
    SetOnClearCallback(onClearCallback?: () => CameraMode): void;
    /**
     * Set the camera's field-of-view.
     * @param fieldOfView Field of view.
     * @param immediate If `true`, goes directly to the FOV without springing towards it.
     */
    SetFOV(cameraType: CharacterCameraType, fieldOfView: number, immediate?: boolean): void;
    private UpdateFOVSpring;
    private UpdateFOV;
    /**
     * Register a callback to be run after the camera mode has generated a camera transform. Callback can return a modified
     * CameraTransform to update the camera for this frame.
     *
     * @returns Clean up function to unregister callback
     */
    OnUpdateTransform(callback: (cameraTransform: CameraTransform) => CameraTransform | void): () => void;
}
