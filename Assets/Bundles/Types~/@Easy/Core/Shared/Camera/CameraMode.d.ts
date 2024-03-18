import { CameraTransform } from "./CameraTransform";
/**
 * Represents a camera mode that can attached to the camera system.
 */
export declare abstract class CameraMode {
    rotationX: number;
    rotationY: number;
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
declare const _default: {};
export default _default;
